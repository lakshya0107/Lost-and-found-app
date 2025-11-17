// /controllers/adminController.js

const { query } = require('../utils/db');
const htmlRenderer = require('../utils/htmlRenderer');

// --- NEW FUNCTION ---
// Displays the form for reporting a new item
exports.getReportForm = (req, res) => {
    res.send(htmlRenderer.renderReportForm(req.user, req.query.error));
};

// --- NEW FUNCTION (Moved from itemController) ---
// Handles submission of the new item form
exports.handleReportSubmission = async (req, res) => {
    const { title, description, category, location } = req.body;
    // req.user.id is guaranteed to exist (Admin)
    const found_by_id = req.user.id; 

    try {
        if (!title || !description || !category || !location) {
            return res.redirect('/admin/report?error=Please fill out all required fields');
        }
        
        const imageUrl = `https://via.placeholder.com/150?text=${category.split(' ')[0]}`; // Placeholder

        const sql = `
            INSERT INTO items (title, description, category, location, image_url, found_by_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Lost')
        `;
        const values = [title, description, category, location, imageUrl, found_by_id];

        await query(sql, values);

        res.redirect('/admin/dashboard?success=Item reported successfully');
    } catch (err) {
        console.error('Error reporting item:', err);
        res.status(500).redirect('/admin/report?error=Database error reporting item');
    }
};


exports.getAdminDashboard = async (req, res) => {
    try {
        // 1. Fetch all pending claims
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

        // 2. Fetch basic analytics
        // FIX: Removed student_count
        const analyticsSql = `
            SELECT 
                (SELECT COUNT(*) FROM items WHERE status = 'Lost') AS lost_count,
                (SELECT COUNT(*) FROM items WHERE status = 'Resolved') AS resolved_count,
                (SELECT COUNT(*) FROM claims WHERE status = 'Pending') AS pending_count
        `;
        const analyticsResult = await query(analyticsSql);
        const analytics = analyticsResult.rows[0];

        // 3. Render the dashboard, passing real data
        res.send(htmlRenderer.renderAdminDashboard(pendingClaims, analytics, req.user));

    } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Failed to load admin panel.</p>', req.user));
    }
};

exports.approveClaim = async (req, res) => {
    const claimId = req.params.claimId;
    const adminId = req.user.id;
    const { pickup_details } = req.body; // <-- NEW: Get pickup details from form

    if (!pickup_details) {
        return res.redirect('/admin/dashboard?error=Pickup details are required to approve a claim.');
    }
    
    try {
        // 1. Get claim/item/user info
        const claimResult = await query(`
            SELECT c.item_id, c.claimed_by_id, i.title AS item_title 
            FROM claims c
            JOIN items i ON c.item_id = i.id
            WHERE c.id = $1
        `, [claimId]);
        
        const { item_id, claimed_by_id, item_title } = claimResult.rows[0];

        if (!item_id) {
             return res.redirect('/admin/dashboard?error=Claim not found');
        }

        // 2. Update claim status AND add pickup details
        const updateClaimSql = `
            UPDATE claims SET status = 'Approved', processed_by_id = $1, processed_at = NOW(), pickup_details = $2
            WHERE id = $3 AND status = 'Pending'
        `;
        await query(updateClaimSql, [adminId, pickup_details, claimId]);

        // 3. Update the item status to 'Resolved'
        await query(`UPDATE items SET status = 'Resolved' WHERE id = $1`, [item_id]);

        // 4. Create in-app notification for the user
        const notifMessage = `Your claim for "${item_title}" was approved. Pickup details: ${pickup_details}`;
        await query(
            'INSERT INTO notifications (user_id, item_id, message) VALUES ($1, $2, $3)',
            [claimed_by_id, item_id, notifMessage]
        );

        res.redirect('/admin/dashboard?success=Claim approved and item resolved.');

    } catch (err) {
        console.error('Error approving claim:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Failed to process claim approval.</p>', req.user));
    }
};

exports.rejectClaim = async (req, res) => {
    const claimId = req.params.claimId;
    const adminId = req.user.id; 
    const { rejection_reason } = req.body; // <-- NEW: Get rejection reason

    if (!rejection_reason) {
        return res.redirect('/admin/dashboard?error=A reason is required to reject a claim.');
    }

    try {
        // 1. Get claim/item/user info
        const claimResult = await query(`
            SELECT c.item_id, c.claimed_by_id, i.title AS item_title 
            FROM claims c
            JOIN items i ON c.item_id = i.id
            WHERE c.id = $1
        `, [claimId]);
        
        const { item_id, claimed_by_id, item_title } = claimResult.rows[0];

        // 2. Update claim status to 'Rejected'
        const sql = `
            UPDATE claims SET status = 'Rejected', processed_by_id = $1, processed_at = NOW()
            WHERE id = $2 AND status = 'Pending'
        `;
        await query(sql, [adminId, claimId]);

        // 3. Create in-app notification for the user
        const notifMessage = `Your claim for "${item_title}" was rejected. Reason: ${rejection_reason}`;
        await query(
            'INSERT INTO notifications (user_id, item_id, message) VALUES ($1, $2, $3)',
            [claimed_by_id, item_id, notifMessage]
        );
        
        // 4. Set item status back to 'Lost' so others can claim it
        await query(`UPDATE items SET status = 'Lost' WHERE id = $1`, [item_id]);

        res.redirect('/admin/dashboard?success=Claim rejected.');

    } catch (err) {
        console.error('Error rejecting claim:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Failed to process claim rejection.</p>', req.user));
    }
};