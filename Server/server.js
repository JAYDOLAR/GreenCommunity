import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import createServer from './app.js';

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force dotenv to load
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Debug: MONGO_URI loaded?', !!process.env.MONGO_URI);
console.log('✅ MONGO_URI found in environment variables');
console.log('📁 Current directory:', __dirname);
console.log('📁 Client directory will be:', process.env.NODE_ENV !== "production" ? path.resolve(__dirname, '../client') : path.resolve(__dirname, './client'));

// Check if client directory exists
const clientDir = process.env.NODE_ENV !== "production" ? path.resolve(__dirname, '../client') : path.resolve(__dirname, './client');
console.log('📁 Checking client directory:', clientDir);

import fs from 'fs';
try {
  const clientDirContents = fs.readdirSync(clientDir);
  console.log('📋 Client directory contents:', clientDirContents);
  
  const srcPath = path.join(clientDir, 'src');
  if (fs.existsSync(srcPath)) {
    const srcContents = fs.readdirSync(srcPath);
    console.log('📋 src directory contents:', srcContents);
  } else {
    console.log('❌ src directory not found at:', srcPath);
  }
} catch (error) {
  console.log('❌ Error reading client directory:', error.message);
}

console.log('MONGO_URI from .env:', process.env.MONGO_URI); // keep this debug

const PORT = process.env.PORT || 5000;

// Initialize the server with Next.js
createServer().then((app) => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
