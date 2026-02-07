import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import createServer from './app.js';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env ONLY in development (Azure does NOT use .env)
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Loaded .env from:', envPath);
  } else {
    console.log('No .env file found in development.');
  }
} else {
  console.log('Production mode detected (Azure). Using App Service settings.');
}

// Validate environment variables
console.log('MONGO_URI available?', !!process.env.MONGO_URI);

// Correct client directory (Next.js build output)
const clientDir = path.resolve(__dirname, 'client');
console.log('Client directory:', clientDir);

// Check basic client folders
try {
  const contents = fs.readdirSync(clientDir);
  console.log('Client folder contents:', contents);
} catch (err) {
  console.log('Cannot read client directory:', err.message);
}

// ---------------------------------------------------------------------------
// PORT: Azure App Service Linux sets PORT (usually 8080).
//       Default to 8080 to match Azure — NOT 5000.
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT, 10) || 8080;
console.log(`PORT env raw="${process.env.PORT}", resolved=${PORT}`);

// ---------------------------------------------------------------------------
// CRITICAL FIX: Start listening IMMEDIATELY so Azure health-check passes.
// Azure kills the container if nothing responds on PORT within ~230 s.
// We serve a lightweight 200 while Next.js + databases initialise in the
// background, then swap in the full Express app once it's ready.
// ---------------------------------------------------------------------------
let isReady = false;

const bootstrapApp = express();

// Health-check endpoint (always available)
bootstrapApp.get('/api/health', (_req, res) => {
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'starting',
    uptime: process.uptime(),
    port: PORT,
  });
});

// While initialising, return 200 so Azure's health probe is satisfied
bootstrapApp.use((_req, res, next) => {
  if (isReady) return next();
  res.status(200).send('GreenCommunity is starting up...');
});

const server = bootstrapApp.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} (health-check active, waiting for full init...)`);
});

// Now initialise the real application (Next.js prepare + DB connections)
createServer()
  .then((app) => {
    // Swap bootstrap handler for the fully initialised Express app
    server.removeAllListeners('request');
    server.on('request', app);
    isReady = true;
    console.log(`Full application ready on port ${PORT}`);
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
