const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    // Allow all localhost origins
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, req.method !== 'GET' ? JSON.stringify(req.body) : '');
  next();
});

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const enrollmentsRoutes = require('./routes/enrollments');
const instructorRoutes = require('./routes/instructor');
const quizzesRoutes = require('./routes/quizzes');
const paymentsRoutes = require('./routes/payments');
const reviewsRoutes = require('./routes/reviews');
const bookmarksRoutes = require('./routes/bookmarks');
const notesRoutes = require('./routes/notes');
const commentsRoutes = require('./routes/comments');
const certificatesRoutes = require('./routes/certificates');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/courses', reviewsRoutes); 
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/admin', adminRoutes);

// ─── Centralized Error Handler ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.',
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 LearnHub server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
