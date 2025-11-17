// /utils/htmlRenderer.js

/**
 * Provides the base HTML structure for all pages.
 * @param {string} title - The page title.
 * @param {string} bodyContent - The content to place inside the <body><main> tags.
 * @param {object} [user=null] - The logged-in user object or null.
 * @returns {string} The full HTML document string.
 */
const getBaseHtml = (title, bodyContent, user = null) => {
    // Dynamic navigation based on user status
    let authNav;
    if (user) {
        // Logged-in view
        authNav = `
            <span class="text-green-600 font-bold hidden sm:inline">Welcome, ${user.name} (${user.role})</span>
            ${user.role === 'Admin' ? '<a href="/admin/dashboard" class="text-yellow-600 hover:text-yellow-700 font-medium">Admin</a>' : ''}
            <a href="/auth/logout" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition duration-150">
                Logout
            </a>
        `;
    } else {
        // Logged-out view
        authNav = `
            <a href="/auth/login" class="text-gray-600 hover:text-indigo-700 font-medium">Login</a>
            <a href="/auth/register" class="text-gray-600 hover:text-indigo-700 font-medium">Register</a>
        `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/css/styles.css"> 
</head>
<body class="bg-gray-100 min-h-screen">
    <header class="bg-white shadow-md p-4 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold text-indigo-700">Campus Lost & Found</h1>
            <nav class="space-x-4 flex items-center">
                <a href="/" class="text-gray-600 hover:text-indigo-700 font-medium">Dashboard</a>
                <a href="/items/report" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium transition duration-150">
                    Report Item
                </a>
                ${authNav}
            </nav>
        </div>
    </header>
    <main class="max-w-7xl mx-auto p-6">
        ${bodyContent}
    </main>
</body>
</html>
`;
};

// Update existing renderers to pass the user object to getBaseHtml

const renderDashboard = (items, user) => {
    // Basic placeholder content for the dashboard
    const itemsList = items.length > 0 ? items.map(item => `
        <div class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="font-bold">${item.title}</h3>
            <p class="text-sm">Found at: ${item.location}</p>
            <a href="/items/${item.id}" class="text-indigo-600 text-sm hover:underline">View Details</a>
        </div>
    `).join('') : '<p class="p-4 text-center">No lost items currently listed.</p>';

    const bodyContent = `
        <h2 class="text-3xl font-extrabold text-gray-800 mb-6">Currently Lost Items (${items.length})</h2>
        ${!user ? '<div class="mb-4 p-3 bg-red-100 text-red-800 rounded">You are viewing the public dashboard. Please <a href="/auth/login" class="font-bold underline">log in</a> to report or claim items.</div>' : ''}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${itemsList}
        </div>
    `;
    // Pass user to the base HTML function
    return getBaseHtml('Lost & Found Dashboard', bodyContent, user); 
};

// Placeholder for other render functions (Item Details, Admin Dashboard, etc.)
const renderLoginForm = (user) => {
    // ... bodyContent (Form HTML) ...
    // NOTE: This form should not usually be shown if a user is logged in, but we pass 'user' for consistency.
    return getBaseHtml('Login', '', user); 
};
const renderRegisterForm = (user) => {
    // ... bodyContent (Form HTML) ...
    return getBaseHtml('Register', '', user); 
};
const renderItemDetails = (item, user) => getBaseHtml(`Item: ${item.title}`, `<h2>${item.title}</h2><p>Details and Claim Form...</p>`, user);
const renderAdminDashboard = (claims, analytics, user) => getBaseHtml('Admin Panel', '<h2>Admin Dashboard</h2><p>Pending Claims and Analytics...</p>', user);


module.exports = {
    getBaseHtml,
    renderDashboard,
    renderLoginForm,
    renderRegisterForm,
    renderItemDetails,
    renderAdminDashboard,
};