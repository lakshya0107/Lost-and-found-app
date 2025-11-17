// /utils/htmlRenderer.js

/**
 * Provides the base HTML structure for all pages.
 * @param {string} title - The page title.
 * @param {string} bodyContent - The content to place inside the <body><main> tags.
 * @returns {string} The full HTML document string.
 */
const getBaseHtml = (title, bodyContent) => `
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
            <nav class="space-x-4">
                <a href="/" class="text-gray-600 hover:text-indigo-700 font-medium">Dashboard</a>
                <a href="/items/report" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium transition duration-150">
                    Report Item
                </a>
                <a href="/auth/login" class="text-gray-600 hover:text-indigo-700">Login</a>
            </nav>
        </div>
    </header>
    <main class="max-w-7xl mx-auto p-6">
        ${bodyContent}
    </main>
</body>
</html>
`;

// --- Specific Renderer Functions (To be expanded later) ---

const renderDashboard = (items) => {
    // Basic placeholder content for the dashboard
    const bodyContent = `
        <h2 class="text-3xl font-extrabold text-gray-800 mb-6">Currently Lost Items (${items.length})</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${items.map(item => `
                <div class="bg-white p-4 rounded-lg shadow-md">
                    <h3 class="font-bold">${item.title}</h3>
                    <p class="text-sm">Found at: ${item.location}</p>
                    <a href="/items/${item.id}" class="text-indigo-600 text-sm hover:underline">View Details</a>
                </div>
            `).join('')}
        </div>
    `;
    return getBaseHtml('Lost & Found Dashboard', bodyContent);
};

const renderLoginForm = () => {
    // Basic placeholder for the login form
    const bodyContent = `
        <div class="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl mt-10">
            <h2 class="text-3xl font-bold text-center text-indigo-700 mb-6">User Login</h2>
            <form action="/auth/login" method="POST" class="space-y-4">
                <input type="email" name="email" placeholder="Email" required 
                    class="w-full p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                <input type="password" name="password" placeholder="Password" required
                    class="w-full p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                <button type="submit" class="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Log In</button>
            </form>
            <p class="mt-4 text-center text-sm text-gray-600">
                Don't have an account? <a href="/auth/register" class="text-indigo-600 hover:underline">Register</a>
            </p>
        </div>
    `;
    return getBaseHtml('Login', bodyContent);
};

module.exports = {
    getBaseHtml,
    renderDashboard,
    renderLoginForm,
    // Add other render functions here (report form, claim details, admin view, etc.)
};