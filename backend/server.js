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
app.use('/api/auth', authRoutes);

// TODO: Mount course routes at /api/courses
// TODO: Mount quiz routes at /api/quizzes
// TODO: Mount payment routes at /api/payments
// TODO: Mount enrollment routes at /api/enrollments

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
