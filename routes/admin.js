// /routes/admin.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role'); // Will be created next

// GET /admin/dashboard - View admin tasks and analytics
router.get('/dashboard', requireAuth, isAdmin, adminController.getAdminDashboard);

// POST /admin/claim/:claimId/approve - Approve a claim
router.post('/claim/:claimId/approve', requireAuth, isAdmin, adminController.approveClaim);

module.exports = router;