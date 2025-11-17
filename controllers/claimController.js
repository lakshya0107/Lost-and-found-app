// /controllers/claimController.js

const { query } = require('../utils/db');
const htmlRenderer = require('../utils/htmlRenderer');

exports.submitClaim = async (req, res) => {
    const itemId = req.params.itemId;
    const claimedById = req.user.id; // User must be authenticated
    const { justification } = req.body;

    try {
        if (!justification) {
            // Error handling or redirect back to item detail page
            return res.redirect(`/items/${itemId}?error=Justification is required`);
        }

        // Check if a claim already exists for this item by this user
        const existingClaim = await query(
            'SELECT id FROM claims WHERE item_id = $1 AND claimed_by_id = $2 AND status = $3', 
            [itemId, claimedById, 'Pending']
        );

        if (existingClaim.rows.length > 0) {
            return res.redirect(`/items/${itemId}?error=Claim already pending`);
        }

        // Insert the new claim
        const sql = `
            INSERT INTO claims (item_id, claimed_by_id, justification, status)
            VALUES ($1, $2, $3, 'Pending')
        `;
        await query(sql, [itemId, claimedById, justification]);
        
        // Update item status to 'Claimed'
        await query('UPDATE items SET status = $1 WHERE id = $2', ['Claimed', itemId]);

        res.redirect(`/items/${itemId}?success=Claim submitted!`);

    } catch (err) {
        console.error('Error submitting claim:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Failed to submit claim.</p>'));
    }
};