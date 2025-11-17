// /utils/jwt.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; // Token expires in 1 day

/**
 * Creates a JSON Web Token for a given user ID.
 * @param {string} userId - The unique ID of the user.
 * @returns {string} The signed JWT token.
 */
exports.createToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};