// /routes/index.js

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController'); // Will be created next

// GET / - Dashboard/Home Page
router.get('/', itemController.getDashboard);

// GET /report - Simple redirect or placeholder (form is under /items/report)
router.get('/report', (req, res) => res.redirect('/items/report'));

module.exports = router;