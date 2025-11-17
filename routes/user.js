// /routes/user.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// GET /user/notifications - Show all of the user's active claims and notifications
// FIX: Renamed route from /my-claims to /notifications
router.get('/notifications', requireAuth, userController.getNotificationsPage);

module.exports = router;