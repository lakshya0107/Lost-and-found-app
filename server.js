// server.js

const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { query } = require('./utils/db'); // Ensures database connection is established

// Import Routers
const indexRouter = require('./routes/index'); 
const authRouter = require('./routes/auth');   
const itemRouter = require('./routes/items');   
const adminRouter = require('./routes/admin'); 

// Load environment variables from .env file
dotenv.config();

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
console.log("Attempting to connect to the database...");

// Body parser for handling form submissions (URL-encoded data)
app.use(express.urlencoded({ extended: true }));

// Body parser for JSON 
app.use(express.json());

// Cookie parser middleware for reading JWTs from cookies
app.use(cookieParser());

// Serve static files (CSS, client-side JS, images)
app.use(express.static('public')); 

// --- Route Mounting ---

// Base application routes
app.use('/', indexRouter); 
// Authentication routes
app.use('/auth', authRouter); 
// Item reporting and management routes
app.use('/items', itemRouter); 
// Admin-specific routes
app.use('/admin', adminRouter);

// --- 404 Error Handler ---
app.use((req, res) => {
    const errorBody = `
        <div class="text-center p-10 mt-10">
            <h1 class="text-6xl font-bold text-indigo-700">404</h1>
            <p class="text-xl text-gray-600 mt-4">Page Not Found</p>
            <a href="/" class="mt-6 inline-block text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition">Go Home</a>
        </div>
    `;
    // NOTE: We do NOT pass req.user to getBaseHtml here as the user might not be defined on a 404 path
    res.status(404).send(require('./utils/htmlRenderer').getBaseHtml('404 Not Found', errorBody));
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🔗 Access the app at http://localhost:${PORT}`);
});