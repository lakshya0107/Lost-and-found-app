// /utils/db.js

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool using the DATABASE_URL from your .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Note: SSL configuration is often required for cloud databases like Neon
    ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false // Required for many cloud providers
    } : false
});

// Event listener to confirm connection upon starting the app
pool.on('connect', () => {
    console.log('✅ PostgreSQL database connected successfully!');
});

// Event listener for critical database errors
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    // In a real application, you might want a more sophisticated restart/reconnect logic
    process.exit(-1); 
});

/**
 * Executes a SQL query against the database pool.
 * @param {string} text - The SQL query string.
 * @param {Array<any>} [params] - Optional array of values for parameterized queries.
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { query };