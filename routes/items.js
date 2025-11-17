// /routes/items.js

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { requireAuth } = require('../middleware/auth'); // Will be created next

// GET /items/report - Display the Report Item Form (Requires Auth)
router.get('/report', (req, res) => {
    // Placeholder for form rendering
    res.send(require('../utils/htmlRenderer').getBaseHtml('Report Item', '<h2>Report Form Here</h2><p>Form submission logic is next.</p>'));
});

// POST /items/report - Handle Report Submission (Requires Auth)
router.post('/report', requireAuth, itemController.handleReportSubmission);

// GET /items/:id - View single item details
router.get('/:id', itemController.getItemDetails);

module.exports = router;