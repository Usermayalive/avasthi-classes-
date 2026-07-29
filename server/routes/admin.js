const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply admin protection to all routes below
router.use(authenticateToken);
router.use(requireAdmin);

// Helper: generate IDs
const generateId = (prefix) => prefix + '-' + Math.random().toString(36).substr(2, 9);

// GET /api/admin/stats - Overview Dashboard statistics
router.get('/stats', (req, res) => {
  const users = db.getUsers();
  const courses = db.getCourses();
  const payments = db.getPayments();
  const attempts = db.getAttempts();

  const totalUsers = users.length;
  const paidStudents = users.filter(u => u.role === 'premium_student').length;
  const freeStudents = users.filter(u => u.role === 'subscriber').length;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCourses = courses.length;
  const quizAttempts = attempts.length;

  res.json({
    totalUsers,
    paidStudents,
    freeStudents,
    totalRevenue,
    totalCourses,
    quizAttempts
  });
});

// GET /api/admin/courses - Fetch full syllabus list
router.get('/courses', (req, res) => {
  res.json(db.getCourses());
});

// POST /api/admin/courses - Create course
router.post('/courses', (req, res) => {
  const { title, description, thumbnail, price } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ message: 'Title and price are required.' });
  }

  const newCourse = {
    id: generateId('c'),
    title,
    description: description || '',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    price: Number(price),
    chapters: []
  };

  const courses = db.getCourses();
  courses.push(newCourse);
  db.saveCourses(courses);

  res.status(201).json(newCourse);
});

// PUT /api/admin/courses/:id - Edit course syllabus & metadata
router.put('/courses/:id', (req, res) => {
  const courses = db.getCourses();
  const idx = courses.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  courses[idx] = { ...courses[idx], ...req.body };
  db.saveCourses(courses);
  res.json(courses[idx]);
});

// DELETE /api/admin/courses/:id - Delete a course
router.delete('/courses/:id', (req, res) => {
  const courses = db.getCourses();
  const filtered = courses.filter(c => c.id !== req.params.id);
  if (courses.length === filtered.length) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  db.saveCourses(filtered);
  res.json({ message: 'Course deleted successfully.' });
});

// GET /api/admin/users - List users with filters
router.get('/users', (req, res) => {
  const { role } = req.query;
  let users = db.getUsers();

  if (role) {
    users = users.filter(u => u.role === role);
  }

  // Redact passwords from payload
  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt
  }));

  res.json(safeUsers);
});

// GET /api/admin/payments - List transaction receipts
router.get('/payments', (req, res) => {
  const payments = db.getPayments();
  const users = db.getUsers();
  
  // Join user email & name for easier admin view
  const formatted = payments.map(p => {
    const user = users.find(u => u.id === p.user_id);
    return {
      ...p,
      userName: user ? user.name : 'Unknown User',
      userEmail: user ? user.email : 'Unknown Email'
    };
  });
  
  res.json(formatted.reverse()); // latest payments first
});

// GET /api/admin/doubt-sessions - Admin list sessions
router.get('/doubt-sessions', (req, res) => {
  res.json(db.getDoubtSessions());
});

// POST /api/admin/doubt-sessions - Add Zoom session link
router.post('/doubt-sessions', (req, res) => {
  const { title, date, time, url, description } = req.body;
  if (!title || !url) {
    return res.status(400).json({ message: 'Title and URL are required.' });
  }

  const newSession = {
    id: generateId('ds'),
    title,
    date: date || 'Weekly',
    time: time || 'Flexible',
    url,
    description: description || ''
  };

  const sessions = db.getDoubtSessions();
  sessions.push(newSession);
  db.saveDoubtSessions(sessions);

  res.status(201).json(newSession);
});

// PUT /api/admin/doubt-sessions/:id - Edit session
router.put('/doubt-sessions/:id', (req, res) => {
  const sessions = db.getDoubtSessions();
  const idx = sessions.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Session not found.' });
  }

  sessions[idx] = { ...sessions[idx], ...req.body };
  db.saveDoubtSessions(sessions);
  res.json(sessions[idx]);
});

// DELETE /api/admin/doubt-sessions/:id - Remove session
router.delete('/doubt-sessions/:id', (req, res) => {
  const sessions = db.getDoubtSessions();
  const filtered = sessions.filter(s => s.id !== req.params.id);
  db.saveDoubtSessions(filtered);
  res.json({ message: 'Session deleted.' });
});

const pdfParse = require('pdf-parse');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const krutidevToUnicode = require('@anthro-ai/krutidev-unicode');

// Configure Multer storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// GET /api/admin/promotions - Fetch admin list of flyers, updates, and results
router.get('/promotions', (req, res) => {
  res.json({
    flyers: db.getFlyers(),
    updates: db.getUpdates(),
    results: db.getResults()
  });
});

// POST /api/admin/flyers - Add Hero Flyer Banner
router.post('/flyers', upload.single('imageFile'), (req, res) => {
  const { title, subtitle, badge, targetExam, imageUrl } = req.body;
  let finalImageUrl = imageUrl;

  if (req.file) {
    finalImageUrl = `/uploads/${req.file.filename}`;
  }

  if (!title || !finalImageUrl) {
    return res.status(400).json({ message: 'Title and image (file or URL) are required.' });
  }

  const newFlyer = {
    id: generateId('flyer'),
    title,
    subtitle: subtitle || '',
    badge: badge || 'NEW BATCH',
    targetExam: targetExam || 'General',
    imageUrl: finalImageUrl,
    active: true,
    createdAt: new Date().toISOString()
  };

  const flyers = db.getFlyers();
  flyers.unshift(newFlyer);
  db.saveFlyers(flyers);

  res.status(201).json(newFlyer);
});

// DELETE /api/admin/flyers/:id - Delete Hero Flyer
router.delete('/flyers/:id', (req, res) => {
  const flyers = db.getFlyers();
  const filtered = flyers.filter(f => f.id !== req.params.id);
  db.saveFlyers(filtered);
  res.json({ message: 'Flyer deleted successfully.' });
});

// POST /api/admin/updates - Add News / Announcement Bulletin
router.post('/updates', (req, res) => {
  const { title, date, year, category, isNew, description } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  const newUpdate = {
    id: generateId('up'),
    title,
    date: date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    year: year || new Date().getFullYear().toString(),
    category: category || 'General',
    isNew: isNew !== undefined ? Boolean(isNew) : true,
    description: description || ''
  };

  const updates = db.getUpdates();
  updates.unshift(newUpdate);
  db.saveUpdates(updates);

  res.status(201).json(newUpdate);
});

// DELETE /api/admin/updates/:id - Delete News Bulletin
router.delete('/updates/:id', (req, res) => {
  const updates = db.getUpdates();
  const filtered = updates.filter(u => u.id !== req.params.id);
  db.saveUpdates(filtered);
  res.json({ message: 'Bulletin deleted successfully.' });
});

// POST /api/admin/results - Add Topper Achievement Record
router.post('/results', upload.single('photoFile'), (req, res) => {
  const { name, exam, rank, year, photoUrl, testimonial } = req.body;
  let finalPhotoUrl = photoUrl;

  if (req.file) {
    finalPhotoUrl = `/uploads/${req.file.filename}`;
  }

  if (!name || !exam || !rank) {
    return res.status(400).json({ message: 'Name, exam, and rank are required.' });
  }

  const newResult = {
    id: generateId('top'),
    name,
    exam,
    rank,
    year: year || new Date().getFullYear().toString(),
    photoUrl: finalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    testimonial: testimonial || ''
  };

  const results = db.getResults();
  results.unshift(newResult);
  db.saveResults(results);

  res.status(201).json(newResult);
});

// DELETE /api/admin/results/:id - Delete Topper Record
router.delete('/results/:id', (req, res) => {
  const results = db.getResults();
  const filtered = results.filter(r => r.id !== req.params.id);
  db.saveResults(filtered);
  res.json({ message: 'Topper record deleted.' });
});

// POST /api/admin/parse-quiz-pdf - Ingest PDF Question Paper and auto-generate Quiz
router.post('/parse-quiz-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    let pdfText = '';
    let quizTitle = 'Automated Online Quiz Test';

    if (req.file) {
      const dataBuffer = fs.readFileSync(req.file.path);
      const parsed = await pdfParse(dataBuffer);
      pdfText = parsed.text;
      quizTitle = req.file.originalname.replace(/\.pdf$/i, '') + ' Quiz';
    } else if (req.body.text) {
      pdfText = req.body.text;
      if (req.body.title) quizTitle = req.body.title;
    } else {
      return res.status(400).json({ message: 'PDF file or text content is required.' });
    }

    // Check if we found any text
    if (!pdfText || !pdfText.trim()) {
      return res.status(400).json({ message: 'No readable text found in the PDF. Please ensure you upload a text-based PDF (like a Word document saved as PDF), and NOT a scanned image.' });
    }

    if (req.body.isKrutiDev === 'true') {
      try {
        pdfText = krutidevToUnicode(pdfText);
      } catch (err) {
        console.error('Kruti Dev conversion error:', err);
      }
    }

    // Extract Answerkey if it exists at the bottom
    const ansMap = {};
    const answerKeyIndex = pdfText.toLowerCase().lastIndexOf('answerkey');
    if (answerKeyIndex !== -1) {
      const answerSection = pdfText.slice(answerKeyIndex);
      const matches = [...answerSection.matchAll(/Q\.?\s*(\d+)\s+([A-D1-4अबसदकखगघ])/gi)];
      matches.forEach(m => {
        ansMap[m[1]] = m[2].toUpperCase();
      });
    }

    // Extract questions & options using regex matching
    let questions = [];
    const lines = pdfText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let curQ = null;
    let curQNum = null;
    let curOpts = [];
    let curCorrectIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Question pattern: Q1., 1., Q.1, Question 1:, प्रश्न 1:, प्र.1
      const qMatch = line.match(/^(?:Q|Question|Ques|प्रश्न|प्र)?\.?\s*(\d+|[०-९]+)\s*[\.\:\-\)]\s*(.+)/i) || line.match(/^(\d+|[०-९]+)\s*[\.\:\-\)]\s*(.+)/i);
      if (qMatch) {
        if (curQ && curOpts.length >= 2) {
          questions.push({
            id: generateId('ques'),
            questionText: curQ,
            options: curOpts.slice(0, 4),
            correctOptionIndex: curCorrectIdx
          });
        }
        curQNum = qMatch[1];
        curQ = qMatch[2];
        curOpts = [];
        curCorrectIdx = 0;

        if (curQNum && ansMap[curQNum]) {
          const char = ansMap[curQNum];
          if (['A', '1', 'अ', 'क'].includes(char)) curCorrectIdx = 0;
          else if (['B', '2', 'ब', 'ख'].includes(char)) curCorrectIdx = 1;
          else if (['C', '3', 'स', 'ग'].includes(char)) curCorrectIdx = 2;
          else if (['D', '4', 'द', 'घ'].includes(char)) curCorrectIdx = 3;
        }

        continue;
      }

      // Option pattern: (A), (1), (अ), (क) or A), 1), अ), क)
      const optStartRegex = /^\s*(?:\([A-D1-4अबसदकखगघ]\)|[A-D1-4अबसदकखगघ][\)\.])/i;
      if (optStartRegex.test(line) && curQ) {
        const parts = line.split(/(?:\([A-D1-4अबसदकखगघ]\)|[A-D1-4अबसदकखगघ][\)\.])/i).map(p => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          curOpts.push(...parts);
          continue;
        }
      }

      // Parse correct answer line: e.g. Ans: A, Answer: B, Correct Option: C, उत्तर: अ
      const ansMatch = line.match(/(?:Ans|Answer|Correct|उत्तर|उ)[^A-Za-z0-9अ-ह]*([A-D1-4अबसदकखगघ])/i);
      if (ansMatch && curQ) {
        const char = ansMatch[1].toUpperCase();
        if (['A', '1', 'अ', 'क'].includes(char)) curCorrectIdx = 0;
        else if (['B', '2', 'ब', 'ख'].includes(char)) curCorrectIdx = 1;
        else if (['C', '3', 'स', 'ग'].includes(char)) curCorrectIdx = 2;
        else if (['D', '4', 'द', 'घ'].includes(char)) curCorrectIdx = 3;
        continue;
      }

      // Append line to question text if options not started
      if (curQ && curOpts.length === 0 && line.length > 3) {
        curQ += ' ' + line;
      }
    }

    if (curQ && curOpts.length >= 2) {
      questions.push({
        id: generateId('ques'),
        questionText: curQ,
        options: curOpts.slice(0, 4),
        correctOptionIndex: curCorrectIdx
      });
    }

    // If no questions could be parsed from the text
    if (questions.length === 0) {
      return res.status(400).json({ message: 'Could not automatically extract questions from this PDF. Please ensure the formatting matches standard multiple-choice conventions (e.g. "Q1. ...", "(A) ...").' });
    }

    const newQuiz = {
      id: generateId('q-pdf'),
      title: quizTitle,
      sourcePdf: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
      durationMinutes: req.body.duration ? parseInt(req.body.duration) : null,
      questions: questions
    };

    const quizzes = db.getQuizzes();
    quizzes.unshift(newQuiz);
    db.saveQuizzes(quizzes);

    res.status(201).json({
      message: 'PDF successfully processed and Digital Test created!',
      quiz: newQuiz
    });
  } catch (error) {
    console.error('PDF Quiz Parse Error:', error);
    res.status(500).json({ message: 'Error processing PDF file. ' + error.message });
  }
});

// GET /api/admin/quizzes - Fetch quizzes list
router.get('/quizzes', (req, res) => {
  res.json(db.getQuizzes());
});

// POST /api/admin/quizzes - Create MCQ Quiz
router.post('/quizzes', (req, res) => {
  const { title, questions } = req.body;
  if (!title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Title and questions array are required.' });
  }

  const newQuiz = {
    id: generateId('q'),
    title,
    questions: questions.map(q => ({
      id: generateId('ques'),
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: Number(q.correctOptionIndex)
    }))
  };

  const quizzes = db.getQuizzes();
  quizzes.push(newQuiz);
  db.saveQuizzes(quizzes);
  res.status(201).json(newQuiz);
});

// DELETE /api/admin/quizzes/:id - Delete Quiz
router.delete('/quizzes/:id', (req, res) => {
  const quizzes = db.getQuizzes();
  const filtered = quizzes.filter(q => q.id !== req.params.id);
  db.saveQuizzes(filtered);
  res.json({ message: 'Quiz deleted successfully.' });
});

module.exports = router;
