// /routes/admin.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role'); 

// GET /admin/dashboard - View admin tasks and analytics
router.get('/dashboard', requireAuth, isAdmin, adminController.getAdminDashboard);

// --- NEW ROUTES for Admin item reporting ---
// GET /admin/report - Display the report item form
router.get('/report', requireAuth, isAdmin, adminController.getReportForm);

// POST /admin/report - Handle the report item submission
router.post('/report', requireAuth, isAdmin, adminController.handleReportSubmission);
// --- End new routes ---

// POST /admin/claim/:claimId/approve - Approve a claim
// FIX: Route now handles pickup_details
router.post('/claim/:claimId/approve', requireAuth, isAdmin, adminController.approveClaim);

// POST /admin/claim/:claimId/reject - Reject a claim
router.post('/claim/:claimId/reject', requireAuth, isAdmin, adminController.rejectClaim);

module.exports = router;