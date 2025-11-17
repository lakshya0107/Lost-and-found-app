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
            return res.status(400).send(htmlRenderer.getBaseHtml('Login Failed', '<p class="text-red-500">Invalid credentials.</p>'));
        }

        // 2. Compare password hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).send(htmlRenderer.getBaseHtml('Login Failed', '<p class="text-red-500">Invalid credentials.</p>'));
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
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">An error occurred during login.</p>'));
    }
};

exports.register = async (req, res) => {
    const { name, email, password, role = 'Student' } = req.body; 

    try {
        // 1. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Insert new user into the database
        const sql = 'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id';
        const result = await query(sql, [name, email, password_hash, role]);
        
        // 3. Auto-login by creating token
        const token = createToken(result.rows[0].id);
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.redirect('/');
    } catch (err) {
        if (err.code === '23505') { // Unique violation (email already exists)
            return res.status(400).send(htmlRenderer.getBaseHtml('Registration Failed', '<p class="text-red-500">Email already in use.</p>'));
        }
        console.error('Registration error:', err);
        res.status(500).send(htmlRenderer.getBaseHtml('Error', '<p class="text-red-500">Registration failed.</p>'));
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};