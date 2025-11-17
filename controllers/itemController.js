// /controllers/itemController.js

const { query } = require('../utils/db');
const htmlRenderer = require('../utils/htmlRenderer');

exports.getDashboard = async (req, res) => {
    try {
        // Fetch all items with status 'Lost'
        const sql = `
            SELECT i.id, i.title, i.category, i.location, i.image_url, i.date_found, u.name as reported_by
            FROM items i
            LEFT JOIN users u ON i.found_by_id = u.id
            WHERE i.status = 'Lost'
            ORDER BY i.date_found DESC
        `;
        const result = await query(sql);
        const items = result.rows;

        // Use req.user (attached by requireAuth middleware) to customize the dashboard
        const user = req.user || null; 

        // NOTE: You must implement htmlRenderer.renderDashboard to handle item display
        res.send(htmlRenderer.renderDashboard(items, user)); 

    } catch (err) {
        console.error('Error fetching dashboard:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Could not load items.</p>'));
    }
};

exports.handleReportSubmission = async (req, res) => {
    const { title, description, category, location } = req.body;
    // req.user.id is guaranteed to exist because of the requireAuth middleware
    const found_by_id = req.user.id; 

    try {
        if (!title || !description || !category || !location) {
            return res.status(400).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Please fill out all required fields.</p>'));
        }
        
        const imageUrl = `https://via.placeholder.com/150?text=${category.split(' ')[0]}`; // Placeholder

        const sql = `
            INSERT INTO items (title, description, category, location, image_url, found_by_id)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [title, description, category, location, imageUrl, found_by_id];

        await query(sql, values);

        res.redirect('/');
    } catch (err) {
        console.error('Error reporting item:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Database error reporting item.</p>'));
    }
};

exports.getItemDetails = async (req, res) => {
    const itemId = req.params.id;
    
    try {
        const sql = `
            SELECT i.*, u.name as reported_by
            FROM items i
            LEFT JOIN users u ON i.found_by_id = u.id
            WHERE i.id = $1
        `;
        const result = await query(sql, [itemId]);
        const item = result.rows[0];

        if (!item) {
            return res.status(404).send(htmlRenderer.getBaseHtml('Not Found', '<h2>Item Not Found</h2>'));
        }
        
        // NOTE: Implement htmlRenderer.renderItemDetails to display the claim form
        res.send(htmlRenderer.renderItemDetails(item, req.user)); 

    } catch (err) {
        console.error('Error fetching item details:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Could not load item details.</p>'));
    }
};