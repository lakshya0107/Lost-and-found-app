// /routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Will be created next
const htmlRenderer = require('../utils/htmlRenderer');

// GET /auth/login - Display Login Form
router.get('/login', (req, res) => {
    res.send(htmlRenderer.renderLoginForm());
});

// POST /auth/login - Handle Login Submission
router.post('/login', authController.login);

// GET /auth/register - Display Registration Form (Placeholder)
router.get('/register', (req, res) => {
    res.send(htmlRenderer.getBaseHtml('Register', '<h2>Registration Form Here</h2><p>Feature coming soon.</p>'));
});

// GET /auth/logout
router.get('/logout', authController.logout);

module.exports = router;