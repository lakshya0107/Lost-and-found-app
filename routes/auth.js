// /routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const htmlRenderer = require('../utils/htmlRenderer');

// GET /auth/login - Display Login Form
router.get('/login', (req, res) => {
    res.send(htmlRenderer.renderLoginForm());
});

// POST /auth/login - Handle Login Submission
router.post('/login', authController.login);

// GET /auth/register - Display Registration Form
router.get('/register', (req, res) => {
    res.send(htmlRenderer.renderRegisterForm()); 
});

// POST /auth/register - Handle Registration Submission
router.post('/register', authController.register);

// GET /auth/logout
router.get('/logout', authController.logout);

module.exports = router;