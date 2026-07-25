const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Helper: Checks if user has full access to a course
function checkCourseAccess(user, courseId) {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'premium_student') {
    return true;
  }
  return false;
}

// GET /api/courses - List all courses (accessible by anyone)
router.get('/', (req, res) => {
  const courses = db.getCourses();
  // Filter or simplify for public viewing
  const simplified = courses.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    thumbnail: c.thumbnail,
    price: c.price,
    chapterCount: c.chapters.length,
    lessonCount: c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
  }));
  res.json(simplified);
});

// GET /api/courses/:id - Course syllabus (dynamic check for preview/locked items)
router.get('/:id', (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  // Detect user from Authorization header (optional for this route)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let hasFullAccess = false;

  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.getUserById(decoded.id);
      if (user && (user.role === 'admin' || user.role === 'premium_student')) {
        hasFullAccess = true;
      }
    } catch (e) {
      // Ignore token verification error, default to guest/subscriber access
    }
  }

  // Deep copy course so we don't modify seed database references in memory
  const redactedCourse = JSON.parse(JSON.stringify(course));

  // Redact URLs for chapters/lessons that are locked
  redactedCourse.chapters.forEach(chapter => {
    // If it's a locked chapter and user doesn't have premium access, redact content
    if (!chapter.isFreePreview && !hasFullAccess) {
      chapter.isLocked = true;
      chapter.lessons.forEach(lesson => {
        if (lesson.type === 'video') {
          lesson.videoUrl = null; // hide video link
        }
        if (lesson.type === 'pdf') {
          lesson.pdfUrl = null; // hide pdf download link
        }
        if (lesson.type === 'quiz') {
          lesson.quizId = null; // hide quiz ID
        }
        lesson.isLocked = true;
      });
    } else {
      chapter.isLocked = false;
      chapter.lessons.forEach(lesson => {
        lesson.isLocked = false;
      });
    }
  });

  res.json(redactedCourse);
});

// GET /api/progress - Fetch current user's progress
router.get('/progress/all', authenticateToken, (req, res) => {
  const progress = db.getUserProgress(req.user.id);
  res.json(progress);
});

// POST /api/courses/:id/progress - Record video progress percentage
router.post('/:id/progress', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  const { lessonId, watchedPercentage } = req.body;

  if (!lessonId || watchedPercentage === undefined) {
    return res.status(400).json({ message: 'lessonId and watchedPercentage are required.' });
  }

  // Validate that course exists
  const course = db.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  // Find chapter and check access
  let lessonFound = null;
  let chapterIsFree = false;
  course.chapters.forEach(ch => {
    const les = ch.lessons.find(l => l.id === lessonId);
    if (les) {
      lessonFound = les;
      chapterIsFree = ch.isFreePreview;
    }
  });

  if (!lessonFound) {
    return res.status(404).json({ message: 'Lesson not found in this course.' });
  }

  // Enforce content wall
  const hasFullAccess = checkCourseAccess(req.user, courseId);
  if (!chapterIsFree && !hasFullAccess) {
    return res.status(403).json({ message: 'This is premium content. Please upgrade to unlock.' });
  }

  const updatedProgress = db.updateVideoProgress(
    req.user.id,
    courseId,
    lessonId,
    watchedPercentage
  );

  res.json(updatedProgress);
});

// GET /api/quizzes/:id - Fetch quiz questions
router.get('/quiz/:id', authenticateToken, (req, res) => {
  const quiz = db.getQuizById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found.' });
  }

  // Check if this quiz belongs to a locked chapter
  const courses = db.getCourses();
  let belongsToFreeChapter = false;
  let courseId = '';

  courses.forEach(course => {
    course.chapters.forEach(ch => {
      const hasQuiz = ch.lessons.some(l => l.type === 'quiz' && l.quizId === quiz.id);
      if (hasQuiz) {
        courseId = course.id;
        if (ch.isFreePreview) {
          belongsToFreeChapter = true;
        }
      }
    });
  });

  const hasFullAccess = checkCourseAccess(req.user, courseId);
  if (!belongsToFreeChapter && !hasFullAccess) {
    return res.status(403).json({ message: 'This quiz is part of premium course syllabus.' });
  }

  // Return quiz details, redacting the correct answer indices for safety during test
  const quizDetails = JSON.parse(JSON.stringify(quiz));
  quizDetails.questions.forEach(q => {
    delete q.correctOptionIndex; // hide correct answers
  });

  res.json(quizDetails);
});

// POST /api/quizzes/:id/attempt - Submit quiz answers
router.post('/quiz/:id/attempt', authenticateToken, (req, res) => {
  const quizId = req.params.id;
  const { answers } = req.body; // array of indices matching questions order

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Answers array is required.' });
  }

  const quiz = db.getQuizById(quizId);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found.' });
  }

  // Find course associated
  const courses = db.getCourses();
  let courseId = '';
  let courseTitle = '';
  courses.forEach(c => {
    c.chapters.forEach(ch => {
      if (ch.lessons.some(l => l.type === 'quiz' && l.quizId === quizId)) {
        courseId = c.id;
        courseTitle = c.title;
      }
    });
  });

  // Calculate score
  let score = 0;
  const resultDetails = quiz.questions.map((q, idx) => {
    const isCorrect = q.correctOptionIndex === answers[idx];
    if (isCorrect) score++;
    return {
      questionText: q.questionText,
      options: q.options,
      correctIndex: q.correctOptionIndex,
      submittedIndex: answers[idx],
      isCorrect
    };
  });

  // Save quiz attempt record
  const attemptRecord = {
    id: 'att-' + Math.random().toString(36).substr(2, 9),
    user_id: req.user.id,
    quiz_id: quizId,
    quiz_title: quiz.title,
    course_id: courseId,
    course_title: courseTitle,
    score,
    totalQuestions: quiz.questions.length,
    attemptedAt: new Date().toISOString()
  };

  db.saveAttempt(attemptRecord);

  // Return answers feedback and score
  res.json({
    score,
    totalQuestions: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
    details: resultDetails
  });
});

// GET /api/quizzes/attempts - List of user's past quiz attempts
router.get('/quiz-attempts/history', authenticateToken, (req, res) => {
  const history = db.getUserAttempts(req.user.id);
  res.json(history);
});

// GET /api/doubt-sessions - Get live session links (Paid Users Only)
router.get('/doubt/sessions', authenticateToken, (req, res) => {
  const isPremium = req.user.role === 'admin' || req.user.role === 'premium_student';

  if (!isPremium) {
    return res.status(403).json({
      message: 'Access Denied.',
      isLocked: true,
      sessions: []
    });
  }

  const sessions = db.getDoubtSessions();
  res.json({
    isLocked: false,
    sessions
  });
});

module.exports = router;
