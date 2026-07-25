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

module.exports = router;
