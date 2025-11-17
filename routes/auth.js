// /routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const htmlRenderer = require('../utils/htmlRenderer');

// GET /auth/login - Display Login Form
router.get('/login', (req, res) => {
    // FIX: Pass the error from query params to the renderer
    // We pass 'null' for user because they aren't authenticated yet.
    res.send(htmlRenderer.renderLoginForm(null, req.query.error));
});

// POST /auth/login - Handle Login Submission
router.post('/login', authController.login);

// GET /auth/register - Display Registration Form
router.get('/register', (req, res) => {
    // FIX: Pass the error from query params to the renderer
    res.send(htmlRenderer.renderRegisterForm(null, req.query.error)); 
});

// POST /auth/register - Handle Registration Submission
router.post('/register', authController.register);

// GET /auth/logout
router.get('/logout', authController.logout);

module.exports = router;