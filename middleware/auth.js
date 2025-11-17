// /middleware/auth.js

const jwt = require('jsonwebtoken');
const { query } = require('../utils/db');
const htmlRenderer = require('../utils/htmlRenderer');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to check for a valid JWT and attach user data to the request
exports.requireAuth = async (req, res, next) => {
    // 1. Get token from the cookie
    const token = req.cookies.token;

    if (!token) {
        // If no token, redirect to login page
        return res.status(401).redirect('/auth/login');
    }

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Fetch user data from DB using the decoded user ID
        const result = await query('SELECT id, email, role, name FROM users WHERE id = $1', [decoded.userId]);

        if (result.rows.length === 0) {
            // Token is valid but user doesn't exist
            res.clearCookie('token');
            return res.status(401).redirect('/auth/login');
        }

        // 4. Attach user object to the request for use in controllers
        req.user = result.rows[0]; 
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        res.clearCookie('token');
        // Token invalid or expired
        return res.status(401).redirect('/auth/login');
    }
};