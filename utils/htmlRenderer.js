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
    let authNav = '';
    let userNav = ''; // Will remain empty for logged-out users and Admins

    if (user) {
        // Logged-in view
        
        // FIX: Only show "Notifications" if the user is NOT an Admin
        if (user.role !== 'Admin') {
            userNav = `
                <a href="/user/notifications" class="text-gray-600 hover:text-indigo-700 font-medium">Notifications</a>
            `;
        }
        
        authNav = `
            <span class="text-green-600 font-bold hidden sm:inline">Welcome, ${user.name} (${user.role})</span>
            ${user.role === 'Admin' ? '<a href="/admin/dashboard" class="text-yellow-600 hover:text-yellow-700 font-medium">Admin Panel</a>' : ''}
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
                ${userNav}
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

// --- RENDER DASHBOARD (with Search) ---
const renderDashboard = (items, user, queryParams = {}) => {
    const { search = '', category = '' } = queryParams;

    const itemsList = items.length > 0 ? items.map(item => `
        <a href="/items/${item.id}" class="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-150">
            <img src="${item.image_url}" alt="${item.title}" class="w-full h-32 object-cover rounded-md mb-2">
            <h3 class="font-bold text-lg text-indigo-700">${item.title}</h3>
            <p class="text-sm text-gray-600">Category: ${item.category}</p>
            <p class="text-sm text-gray-600">Found at: ${item.location}</p>
            <p class="text-xs text-gray-400 mt-1">Reported by: ${item.reported_by} on ${new Date(item.date_found).toLocaleDateString()}</p>
        </a>
    `).join('') : '<p class="p-4 text-center text-gray-500 col-span-full">No lost items found matching your criteria.</p>';

    const bodyContent = `
        <h2 class="text-3xl font-extrabold text-gray-800 mb-6">Currently Lost Items</h2>
        
        <form action="/" method="GET" class="mb-8 bg-white p-4 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
                <input type="text" name="search" id="search" value="${search}" placeholder="e.g., Wallet, Keys..."
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" id="category"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">All Categories</option>
                    <option value="Electronics" ${category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                    <option value="Apparel" ${category === 'Apparel' ? 'selected' : ''}>Apparel</option>
                    <option value="Keys" ${category === 'Keys' ? 'selected' : ''}>Keys</option>
                    <option value="Bags" ${category === 'Bags' ? 'selected' : ''}>Bags</option>
                    <option value="Books" ${category === 'Books' ? 'selected' : ''}>Books / Notebooks</option>
                    <option value="Other" ${category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="flex items-end">
                <button type="submit"
                        class="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Filter
                </button>
            </div>
        </form>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${itemsList}
        </div>
    `;
    return getBaseHtml('Lost & Found Dashboard', bodyContent, user); 
};

// --- RENDER ITEM DETAILS (Smarter) ---
const renderItemDetails = (item, user, userClaim = null) => {
    let claimSection = '';

    if (user) { // User is logged in
        if (userClaim) {
            // User has already made a claim for this item
            switch(userClaim.status) {
                case 'Pending':
                    claimSection = `
                        <div class="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                            <h3 class="font-bold">Your claim is pending review.</h3>
                            <p>You submitted a claim on ${new Date(userClaim.date_claimed).toLocaleString()}. You will be notified on the "Notifications" page when it is reviewed.</p>
                        </div>`;
                    break;
                case 'Approved':
                    claimSection = `
                        <div class="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                            <h3 class="font-bold">Your claim was APPROVED!</h3>
                            <p class="font-medium mt-2">Pickup Details:</p>
                            <p class="whitespace-pre-wrap">${userClaim.pickup_details}</p>
                        </div>`;
                    break;
                case 'Rejected':
                    claimSection = `
                        <div class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                            <h3 class="font-bold">Your claim was rejected.</h3>
                            <p>Please check the "Notifications" page for more details.</p>
                        </div>`;
                    break;
            }
        } else if (item.status === 'Lost') {
            // Item is available and user has NOT claimed it yet
            claimSection = `
                <h3 class="text-xl font-bold text-gray-800 mb-4">Want to claim this item?</h3>
                <form action="/items/${item.id}/claim" method="POST" class="space-y-4">
                    <div>
                        <label for="justification" class="block text-sm font-medium text-gray-700">Justification</label>
                        <textarea id="justification" name="justification" rows="4" required placeholder="Describe the item and why it's yours. e.g., 'It's a black wallet with a blue debit card and my student ID.'"
                                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                    <div>
                        <button type="submit"
                                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Submit Claim
                        </button>
                    </div>
                </form>
            `;
        } else {
            // Item is Claimed, Resolved, etc.
            claimSection = `
                <div class="p-4 bg-gray-200 border-l-4 border-gray-500 text-gray-700">
                    <h3 class="font-bold">This item is no longer available.</h3>
                    <p>This item has already been claimed or resolved.</p>
                </div>`;
        }
    } else { // User is logged out
        // This section should now be unreachable due to requireAuth, but good to keep as a fallback.
        claimSection = `
            <div class="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                <h3 class="font-bold">Is this your item?</h3>
                <p><a href="/auth/login?redirect=/items/${item.id}" class="font-medium underline">Login</a> or <a href="/auth/register" class="font-medium underline">Register</a> to submit a claim.</p>
            </div>
        `;
    }

    const bodyContent = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
            <div class="md:flex">
                <div class="md:flex-shrink-0">
                    <img src="${item.image_url}" alt="${item.title}" class="h-64 w-full object-cover md:w-64">
                </div>
                <div class="p-8 flex-grow">
                    <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">${item.category}</div>
                    <h1 class="block mt-1 text-4xl leading-tight font-extrabold text-black">${item.title}</h1>
                    <p class="mt-4 text-lg text-gray-700">${item.description}</p>
                    
                    <div class="mt-6">
                        <p class="text-gray-600"><span class="font-medium">Location:</span> ${item.location}</p>
                        <p class="text-gray-600"><span class="font-medium">Found By:</span> ${item.reported_by}</p>
                        <p class="text-gray-600"><span class="font-medium">Date Found:</span> ${new Date(item.date_found).toLocaleDateString()}</p>
                        <p class="text-gray-600"><span class="font-medium">Status:</span> 
                            <span class="font-semibold ${item.status === 'Lost' ? 'text-red-600' : 'text-green-600'}">${item.status}</span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="p-8 border-t border-gray-200">
                ${claimSection}
            </div>
        </div>
    `;
    return getBaseHtml(`Item: ${item.title}`, bodyContent, user);
};

// --- RENDER LOGIN FORM (Unchanged) ---
const renderLoginForm = (user, error = null) => {
    const bodyContent = `
        <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Login</h2>
            ${error ? `<div class="mb-4 p-3 bg-red-100 text-red-800 rounded text-center">${error}</div>` : ''}
            <form action="/auth/login" method="POST" class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" name="email" required
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" name="password" required
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150">
                        Sign In
                    </button>
                </div>
            </form>
            <p class="mt-6 text-center text-sm text-gray-600">
                Don't have an account? 
                <a href="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Register here
                </a>
            </p>
        </div>
    `;
    return getBaseHtml('Login', bodyContent, user); 
};

// --- RENDER REGISTER FORM (Unchanged) ---
const renderRegisterForm = (user, error = null) => {
    const bodyContent = `
        <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Create Account</h2>
            ${error ? `<div class="mb-4 p-3 bg-red-100 text-red-800 rounded text-center">${error}</div>` : ''}
            <form action="/auth/register" method="POST" class="space-y-6">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" id="name" name="name" required
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" name="email" required
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" name="password" required
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="role" class="block text-sm font-medium text-gray-700">I am a:</label>
                    <select id="role" name="role" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                    </select>
                </div>
                <div>
                    <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150">
                        Create Account
                    </button>
                </div>
            </form>
            <p class="mt-6 text-center text-sm text-gray-600">
                Already have an account? 
                <a href="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Login here
                </a>
            </p>
        </div>
    `;
    return getBaseHtml('Register', bodyContent, user); 
};

// --- NEW FUNCTION: RENDER REPORT FORM (for Admins) ---
const renderReportForm = (user, error = null) => {
    const bodyContent = `
        <div class="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Report a New Item (Admin)</h2>
            <p class="text-center text-gray-600 mb-6">Fill out the form below to add a new item to the dashboard.</p>
            ${error ? `<div class="mb-4 p-3 bg-red-100 text-red-800 rounded text-center">${error}</div>` : ''}
            
            <form action="/admin/report" method="POST" class="space-y-6">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Item Title</label>
                    <input type="text" id="title" name="title" required placeholder="e.g., Black Leather Wallet"
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" rows="4" required placeholder="e.g., Found near the library entrance. Contains a student ID."
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>

                <div>
                    <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                    <select id="category" name="category" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select a category...</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Apparel">Apparel</option>
                        <option value="Keys">Keys</option>
                        <option value="Bags">Bags</option>
                        <option value="Books">Books / Notebooks</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                 <div>
                    <label for="location" class="block text-sm font-medium text-gray-700">Location Found</label>
                    <input type="text" id="location" name="location" required placeholder="e.g., Library, Cafeteria, Quad"
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                    <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150">
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
    `;
    return getBaseHtml('Report Item', bodyContent, user);
};

// --- FIX: Renamed function to renderNotificationsPage ---
const renderNotificationsPage = (user, claims, notifications) => {
    
    // 1. Build Notifications List
    const notifList = notifications.length > 0 ? notifications.map(n => `
        <div class="p-4 mb-4 ${n.is_read ? 'bg-gray-100' : 'bg-blue-100'} border-l-4 ${n.is_read ? 'border-gray-400' : 'border-blue-500'}">
            <p class="text-gray-800">${n.message}</p>
            <p class="text-xs text-gray-500 mt-1">${new Date(n.created_at).toLocaleString()}</p>
        </div>
    `).join('') : '<p class="text-gray-500">You have no new notifications.</p>';

    // 2. Build Claims List
    const claimsList = claims.length > 0 ? claims.map(c => {
        let statusColor = '';
        let statusText = '';
        switch(c.status) {
            case 'Pending': 
                statusColor = 'bg-yellow-100 border-yellow-500 text-yellow-800'; 
                statusText = 'Your claim is pending review.';
                break;
            case 'Approved': 
                statusColor = 'bg-green-100 border-green-500 text-green-800';
                statusText = `<strong>Claim Approved!</strong><br><strong>Pickup Details:</strong> ${c.pickup_details || 'N/A'}`;
                break;
            case 'Rejected': 
                statusColor = 'bg-red-100 border-red-500 text-red-800';
                statusText = 'Your claim was rejected. Please check notifications for details.';
                break;
        }

        return `
            <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-indigo-700">
                        <a href="/items/${c.item_id}" class="hover:underline">${c.item_title}</a>
                    </h3>
                    <span class="text-sm font-medium px-3 py-1 rounded-full ${statusColor}">${c.status}</span>
                </div>
                <p class="text-gray-600 mt-2"><strong>Your Justification:</strong> "${c.justification}"</p>
                <p class="text-sm text-gray-500 mt-2">Claimed on: ${new Date(c.date_claimed).toLocaleString()}</p>
                <div class="mt-3 p-3 rounded ${statusColor}">
                    ${statusText}
                </div>
            </div>
        `;
    }).join('') : '<p class="text-gray-500">You have not made any claims.</p>';


    const bodyContent = `
        <h2 class="text-3xl font-extrabold text-gray-800 mb-6">My Notifications</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <h3 class="text-2xl font-bold text-gray-700 mb-4">Claim Status</h3>
                <div class="space-y-4">
                    ${claimsList}
                </div>
            </div>

            <div class="lg:col-span-1">
                <h3 class="text-2xl font-bold text-gray-700 mb-4">Updates</h3>
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    ${notifList}
                </div>
            </div>
        </div>
    `;

    return getBaseHtml('My Notifications', bodyContent, user);
};

// --- RENDER ADMIN DASHBOARD (Redesigned) ---
const renderAdminDashboard = (pendingClaims, analytics, user) => {

    const claimsList = pendingClaims.length > 0 ? pendingClaims.map(c => `
        <li class="bg-gray-50 p-4 rounded-lg shadow-sm space-y-3">
            <div class="flex justify-between items-center">
                <h4 class="text-lg font-bold text-indigo-700">${c.item_title}</h4>
                <span class="text-sm text-gray-500">${new Date(c.date_claimed).toLocaleDateString()}</span>
            </div>
            <p class="text-sm"><span class="font-medium">Claimant:</span> ${c.claimant_name}</p>
            <p class="text-sm bg-gray-100 p-2 rounded"><span class="font-medium">Justification:</span> "${c.justification}"</p>
            
            <div class="pt-2 border-t space-y-4">
                <form action="/admin/claim/${c.claim_id}/approve" method="POST" class="space-y-2">
                    <label for="pickup_details_${c.claim_id}" class="block text-sm font-medium text-green-700">Approval & Pickup Details:</label>
                    <textarea id="pickup_details_${c.claim_id}" name="pickup_details" rows="2" required placeholder="e.g., Room 101, Mon 2-4 PM"
                              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                    <button type="submit" class="w-full text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Approve
                    </button>
                </form>
                
                <form action="/admin/claim/${c.claim_id}/reject" method="POST" class="space-y-2">
                     <label for="rejection_reason_${c.claim_id}" class="block text-sm font-medium text-red-700">Rejection Reason:</label>
                    <input type="text" id="rejection_reason_${c.claim_id}" name="rejection_reason" required placeholder="e.g., Justification not specific enough"
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500">
                    <button type="submit" class="w-full text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Reject
                    </button>
                </form>
            </div>
        </li>
    `).join('') : '<p class="text-gray-500">No pending claims.</p>';

    // This is just the HTML for the form, to be embedded in the dashboard
    const reportFormHtml = `
            <form action="/admin/report" method="POST" class="space-y-6">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Item Title</label>
                    <input type="text" id="title" name="title" required placeholder="e.g., Black Leather Wallet"
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" rows="3" required placeholder="e.g., Found near library"
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                <div>
                    <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                    <select id="category" name="category" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select...</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Apparel">Apparel</option>
                        <option value="Keys">Keys</option>
                        <option value="Bags">Bags</option>
                        <option value="Books">Books / Notebooks</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                 <div>
                    <label for="location" class="block text-sm font-medium text-gray-700">Location Found</label>
                    <input type="text" id="location" name="location" required placeholder="e.g., Library, Cafeteria"
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150">
                        Submit Report
                    </button>
                </div>
            </form>
    `;

    // Final Admin Dashboard Body Content
    const adminBodyContent = `
        <h2 class="text-3xl font-extrabold text-gray-800 mb-6">Admin Dashboard</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-medium text-gray-500">Items Currently Lost</h3>
                <p class="text-4xl font-bold text-red-600">${analytics.lost_count}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-medium text-gray-500">Items Resolved</h3>
                <p class="text-4xl font-bold text-green-600">${analytics.resolved_count}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-medium text-gray-500">Pending Claims</h3>
                <p class="text-4xl font-bold text-yellow-600">${analytics.pending_count}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <h3 class="text-2xl font-bold text-gray-700 mb-4">Pending Claims</h3>
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <ul class="space-y-6">
                        ${claimsList}
                    </ul>
                </div>
            </div>

            <div class="lg:col-span-1 space-y-6">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-2xl font-bold text-gray-700 mb-4">Report New Item</h3>
                    ${reportFormHtml}
                </div>
            </div>
        </div>
    `;

    return getBaseHtml('Admin Dashboard', adminBodyContent, user);
};


module.exports = {
    getBaseHtml,
    renderDashboard,
    renderLoginForm,
    renderRegisterForm,
    renderReportForm, // For Admin /admin/report route
    renderItemDetails,
    renderAdminDashboard,
    renderNotificationsPage // FIX: Export renamed function
};