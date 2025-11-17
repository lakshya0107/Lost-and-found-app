// /controllers/itemController.js

const { query } = require('../utils/db');
const htmlRenderer = require('../utils/htmlRenderer');

exports.getDashboard = async (req, res) => {
    // FIX: Implement Search and Filter (FR-3)
    const { search, category } = req.query;
    const user = req.user; 

    let sql = `
        SELECT i.id, i.title, i.category, i.location, i.image_url, i.date_found, u.name as reported_by
        FROM items i
        LEFT JOIN users u ON i.found_by_id = u.id
        WHERE i.status = 'Lost'
    `;
    
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        sql += ` AND (i.title ILIKE $${params.length} OR i.description ILIKE $${params.length})`;
    }

    if (category) {
        params.push(category);
        sql += ` AND i.category = $${params.length}`;
    }

    sql += ` ORDER BY i.date_found DESC`;

    try {
        const result = await query(sql, params);
        const items = result.rows;

        // Pass user, search, and category to the renderer
        res.send(htmlRenderer.renderDashboard(items, user, { search, category })); 

    } catch (err) {
        console.error('Error fetching dashboard:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Could not load items.</p>'));
    }
};

// REMOVED: handleReportSubmission
// This logic is now in adminController.js

exports.getItemDetails = async (req, res) => {
    const itemId = req.params.id;
    const userId = req.user ? req.user.id : null;
    
    try {
        // 1. Get item details
        const itemSql = `
            SELECT i.*, u.name as reported_by
            FROM items i
            LEFT JOIN users u ON i.found_by_id = u.id
            WHERE i.id = $1
        `;
        const itemResult = await query(itemSql, [itemId]);
        const item = itemResult.rows[0];

        if (!item) {
            return res.status(404).send(htmlRenderer.getBaseHtml('Not Found', '<h2>Item Not Found</h2>', req.user));
        }

        let userClaim = null;
        if (userId) {
            // 2. Get the current user's claim for this item, if it exists
            const claimSql = `
                SELECT id, status, justification, pickup_details FROM claims
                WHERE item_id = $1 AND claimed_by_id = $2
                ORDER BY date_claimed DESC LIMIT 1
            `;
            const claimResult = await query(claimSql, [itemId, userId]);
            userClaim = claimResult.rows[0]; // Will be undefined if no claim
        }
        
        // 3. Render page, passing in the item and the user's specific claim
        res.send(htmlRenderer.renderItemDetails(item, req.user, userClaim)); 

    } catch (err) {
        console.error('Error fetching item details:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Could not load item details.</p>', req.user));
    }
};