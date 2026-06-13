const path = require('path');

// Load .env file BEFORE anything else — standalone Next.js doesn't auto-load it
try {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch {
    // dotenv not available — env vars must be set via hosting panel
}

// Next.js standalone entry point wrapper
process.env.NODE_ENV = 'production';

// Import and run the actual standalone server built by Next.js
require('./.next/standalone/server.js');