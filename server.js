const path = require('path');

// Next.js standalone entry point wrapper
process.env.NODE_ENV = 'production';

// Import and run the actual standalone server built by Next.js
require('./.next/standalone/server.js');