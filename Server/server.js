import express from 'express';
import next from 'next';
import path from 'path';

export default async function createServer({ clientDir }) {
  const dev = process.env.NODE_ENV !== 'production';

  const nextApp = next({
    dev,
    dir: clientDir,
  });

  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();

  // Serve static files from client/public
  app.use('/public', express.static(path.join(clientDir, 'public')));

  // Catch-all handler to serve Next.js pages
  app.all('*', (req, res) => handle(req, res));

  return app;
}
