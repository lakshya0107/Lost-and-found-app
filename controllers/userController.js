// /controllers/userController.js

const { query } = require('../utils/db');
const htmlRenderer = require('../utils/htmlRenderer');

// FIX: Renamed function to getNotificationsPage
exports.getNotificationsPage = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Get all of the user's claims
        const claimsSql = `
            SELECT c.id, c.status, c.justification, c.pickup_details, c.date_claimed,
                   i.title AS item_title, i.id AS item_id
            FROM claims c
            JOIN items i ON c.item_id = i.id
            WHERE c.claimed_by_id = $1
            ORDER BY c.date_claimed DESC
        `;
        const claimsResult = await query(claimsSql, [userId]);
        const claims = claimsResult.rows;

        // 2. Get all of the user's notifications
        // FIX: Added 'is_read' to the SELECT statement
        const notifSql = `
            SELECT id, message, created_at, item_id, is_read
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const notifResult = await query(notifSql, [userId]);
        const notifications = notifResult.rows;

        // 3. Render the page with both sets of data
        // FIX: Call the renamed renderNotificationsPage
        res.send(htmlRenderer.renderNotificationsPage(req.user, claims, notifications));

    } catch (err) {
        console.error('Error fetching user claims:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Could not load your notifications.</p>', req.user));
    }
};