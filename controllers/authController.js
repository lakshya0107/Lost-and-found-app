// /controllers/authController.js

const bcrypt = require('bcryptjs');
const { query } = require('../utils/db');
const { createToken } = require('../utils/jwt');
const htmlRenderer = require('../utils/htmlRenderer');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // 1. Find user by email
        const userResult = await query('SELECT id, password_hash, role FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            // FIX: Redirect back to login with an error
            return res.redirect('/auth/login?error=Invalid credentials');
        }

        // 2. Compare password hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            // FIX: Redirect back to login with an error
            return res.redirect('/auth/login?error=Invalid credentials');
        }

        // 3. Create and set JWT token
        const token = createToken(user.id);
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 24 * 60 * 60 * 1000 
        });

        // 4. Redirect based on role
        if (user.role === 'Admin') {
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/');

    } catch (err) {
        console.error('Login error:', err);
        // FIX: Redirect back to login with a generic error
        res.redirect('/auth/login?error=An internal error occurred');
    }
};

exports.register = async (req, res) => {
    // FIX: Read 'role' from the request body
    const { name, email, password, role } = req.body; 
    
    // FIX: Add basic validation
    if (!name || !email || !password || !role) {
        return res.redirect('/auth/register?error=All fields are required');
    }
    
    // FIX: Security check to prevent registering as Admin
    if (role !== 'Student' && role !== 'Faculty') {
        return res.redirect('/auth/register?error=Invalid role selected');
    }

    try {
        // 1. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Insert new user into the database
        // FIX: Pass the 'role' variable to the SQL query
        const sql = 'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id';
        const result = await query(sql, [name, email, password_hash, role]);
        
        // 3. Auto-login by creating token
        const token = createToken(result.rows[0].id);
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.redirect('/');
    } catch (err) {
        if (err.code === '23505') { // Unique violation (email already exists)
            // FIX: Redirect back to register with an error
            return res.redirect('/auth/register?error=Email already in use');
        }
        console.error('Registration error:', err);
        // FIX: Redirect back to register with a generic error
        res.status(500).redirect('/auth/register?error=Registration failed');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};