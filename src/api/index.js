// Vercel serverless entry point — wraps the Express app.
// This file lives at src/api/index.js and is invoked for every /api/* request.
// The vercel.json rewrite sends /api/(.*) here; Express then routes internally.

const app = require('../server/server');

module.exports = app;
