/**
 * TrailSafe API Routes
 */

const express = require('express');
const router  = express.Router();
const { getSafetyAssessment } = require('../controllers/safetyController');

// GET /api/safety?latitude=&longitude=&activity=
router.get('/safety', getSafetyAssessment);

module.exports = router;
