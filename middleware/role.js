// /middleware/role.js

const htmlRenderer = require('../utils/htmlRenderer');

// Middleware to check if the user is an Admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        return next();
    }
    // Deny access if not Admin
    const body = '<div class="text-center mt-20"><h2 class="text-4xl text-red-600">Access Denied</h2><p class="text-lg">You must be an Administrator to view this page.</p><a href="/" class="text-indigo-600 hover:underline mt-4 block">Go Back Home</a></div>';
    res.status(403).send(htmlRenderer.getBaseHtml('Access Denied', body));
};

// Middleware to check if the user is Admin or Faculty (needed for processing claims)
exports.isAdminOrFaculty = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Faculty')) {
        return next();
    }
    const body = '<div class="text-center mt-20"><h2 class="text-4xl text-red-600">Unauthorized</h2><p class="text-lg">Only Faculty and Admins can perform this action.</p><a href="/" class="text-indigo-600 hover:underline mt-4 block">Go Back Home</a></div>';
    res.status(403).send(htmlRenderer.getBaseHtml('Unauthorized', body));
};