const express = require('express');
const cors = require('cors');
const path = require('path');

// Route Imports
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Mock directory for downloadable PDF notes
const NOTES_DIR = path.join(__dirname, 'notes');
app.use('/notes', express.static(NOTES_DIR));

// Create mock notes files so download links don't throw 404
const fs = require('fs');
if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR, { recursive: true });
}
const mockNotes = [
  'rajasthan_history_ch1.pdf', 'rajasthan_geography_ch2.pdf',
  'reet_pedagogy_ch1.pdf', 'police_gk_ch1.pdf', 'patwar_polity_ch1.pdf'
];
mockNotes.forEach(filename => {
  const filePath = path.join(NOTES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `%PDF-1.4 Mock Notes File for Avasthi Classes: ${filename}\nEnjoy studying!`, 'utf-8');
  }
});

// Production Static Serving
const CLIENT_DIST = path.join(__dirname, '../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Avasthi Classes Backend API Server is running. Client build not found. Run "npm run build" to compile frontend.');
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`   AVASTHI CLASSES LMS BACKEND RUNNING   `);
  console.log(`   URL: http://localhost:${PORT}        `);
  console.log(`=========================================`);
});
