import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import createServer from './app.js';

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force dotenv to load
dotenv.config({ path: path.join(__dirname, '.env') });

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
