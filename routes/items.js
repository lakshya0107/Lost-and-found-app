// /routes/items.js

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const claimController = require('../controllers/claimController');
const { requireAuth } = require('../middleware/auth'); 

// GET /items/report - Display the Report Item Form (Requires Auth)
router.get('/report', requireAuth, (req, res) => {
    // Placeholder rendering for the form
    res.send(require('../utils/htmlRenderer').getBaseHtml('Report Item', '<h2>Item Report Form</h2><p>Submission form goes here.</p>'));
});

// POST /items/report - Handle Report Submission (Requires Auth)
router.post('/report', requireAuth, itemController.handleReportSubmission);

// GET /items/:id - View single item details
router.get('/:id', itemController.getItemDetails);

// POST /items/:itemId/claim - Submit a claim for an item (Requires Auth)
router.post('/:itemId/claim', requireAuth, claimController.submitClaim);

module.exports = router;