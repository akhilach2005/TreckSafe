// TrailSafe Backend Server
// Entry point — sets up Express, registers routes, starts listening

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const safetyRoutes = require('./routes/safetyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Safety assessment routes
app.use('/api', safetyRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`TrailSafe backend running on port ${PORT}`);
});
