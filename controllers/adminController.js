// /controllers/adminController.js

const { query } = require('../utils/db');
const htmlRenderer = require('../utils/htmlRenderer');

exports.getAdminDashboard = async (req, res) => {
    try {
        // Fetch all pending claims
        const pendingClaimsSql = `
            SELECT 
                c.id AS claim_id, c.justification, c.date_claimed,
                i.title AS item_title, i.id AS item_id,
                u.name AS claimant_name
            FROM claims c
            JOIN items i ON c.item_id = i.id
            JOIN users u ON c.claimed_by_id = u.id
            WHERE c.status = 'Pending'
            ORDER BY c.date_claimed ASC
        `;
        const pendingClaimsResult = await query(pendingClaimsSql);
        const pendingClaims = pendingClaimsResult.rows;

        // Fetch basic analytics (e.g., total items, total resolved)
        const analyticsSql = `
            SELECT 
                COUNT(*) FILTER (WHERE status = 'Lost') AS lost_count,
                COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved_count,
                COUNT(*) FILTER (WHERE status = 'Archived') AS archived_count
            FROM items;
        `;
        const analyticsResult = await query(analyticsSql);
        const analytics = analyticsResult.rows[0];

        // NOTE: Implement htmlRenderer.renderAdminDashboard to display this data
        res.send(htmlRenderer.renderAdminDashboard(pendingClaims, analytics));

    } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Failed to load admin panel.</p>'));
    }
};

exports.approveClaim = async (req, res) => {
    const claimId = req.params.claimId;
    const adminId = req.user.id;
    
    try {
        // 1. Get the item ID associated with the claim
        const claimResult = await query('SELECT item_id FROM claims WHERE id = $1', [claimId]);
        const itemId = claimResult.rows[0]?.item_id;

        if (!itemId) {
             return res.redirect('/admin/dashboard?error=Claim not found');
        }

        // 2. Update claim status to 'Approved'
        const updateClaimSql = `
            UPDATE claims SET status = 'Approved', processed_by_id = $1, processed_at = NOW()
            WHERE id = $2 AND status = 'Pending'
        `;
        await query(updateClaimSql, [adminId, claimId]);

        // 3. Update the item status to 'Resolved'
        await query(`UPDATE items SET status = 'Resolved' WHERE id = $1`, [itemId]);

        res.redirect('/admin/dashboard?success=Claim approved and item resolved.');

    } catch (err) {
        console.error('Error approving claim:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Failed to process claim approval.</p>'));
    }
};

exports.rejectClaim = async (req, res) => {
    const claimId = req.params.claimId;
    const adminId = req.user.id; 

    try {
        // Update claim status to 'Rejected'
        const sql = `
            UPDATE claims SET status = 'Rejected', processed_by_id = $1, processed_at = NOW()
            WHERE id = $2 AND status = 'Pending'
        `;
        await query(sql, [adminId, claimId]);

        // NOTE: No need to change the item status back to 'Lost' here; 
        // the item remains 'Claimed' until another claim is processed or it's manually reset.
        
        res.redirect('/admin/dashboard?success=Claim rejected.');

    } catch (err) {
        console.error('Error rejecting claim:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Failed to process claim rejection.</p>'));
    }
};