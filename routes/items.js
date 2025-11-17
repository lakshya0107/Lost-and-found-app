// /routes/items.js

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const claimController = require('../controllers/claimController');
const { requireAuth } = require('../middleware/auth'); 
const { optionalAuth } = require('../middleware/optionalAuth'); 
const htmlRenderer = require('../utils/htmlRenderer');

// GET /items/:id - View single item details
// FIX: Changed from optionalAuth to requireAuth
// This forces a login redirect if the user is not authenticated
router.get('/:id', requireAuth, itemController.getItemDetails);

// POST /items/:itemId/claim - Submit a claim for an item (Requires Auth)
router.post('/:itemId/claim', requireAuth, claimController.submitClaim);

module.exports = router;