// /routes/index.js

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { optionalAuth } = require('../middleware/optionalAuth'); 

// Apply optionalAuth so req.user is set if the user is logged in (otherwise req.user is null)
router.get('/', optionalAuth, itemController.getDashboard); 

// GET /report - Redirect to the item reporting form
router.get('/report', (req, res) => res.redirect('/items/report'));

module.exports = router;