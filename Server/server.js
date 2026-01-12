import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import createServer from './app.js';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env ONLY in development (Azure does NOT use .env)
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('🟢 Loaded .env from:', envPath);
  } else {
    console.log('⚠️ No .env file found in development.');
  }
} else {
  console.log('🟢 Production mode detected (Azure). Using App Service settings.');
}

// Validate environment variables
console.log('🔍 MONGO_URI available?', !!process.env.MONGO_URI);

// Correct client directory (Next.js build output)
const clientDir = path.resolve(__dirname, 'client');
console.log('📁 Client directory:', clientDir);

// Check basic client folders (not src/)
try {
  const contents = fs.readdirSync(clientDir);
  console.log('📋 Client folder contents:', contents);
} catch (err) {
  console.log('❌ Cannot read client directory:', err.message);
}

// Server port (Azure injects PORT)
const PORT = process.env.PORT || 5000;

// Start Express + Next.js
createServer()
  .then((app) => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running → http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  });
