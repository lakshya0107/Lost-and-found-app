// /middleware/optionalAuth.js

const jwt = require('jsonwebtoken');
const { query } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET;

exports.optionalAuth = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null; // Ensure req.user is null if not logged in
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await query('SELECT id, email, role, name FROM users WHERE id = $1', [decoded.userId]);

        if (result.rows.length > 0) {
            req.user = result.rows[0]; 
        } else {
            req.user = null;
        }
        next();
    } catch (err) {
        // If token is invalid or expired, proceed without attaching user, but clear the bad cookie.
        res.clearCookie('token');
        req.user = null;
        next();
    }
};