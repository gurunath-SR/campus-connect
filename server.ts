import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './backend/config/db.ts';
import { seedDatabase } from './backend/seed/seedData.ts';
import { createBackendApp } from './backend/app.ts';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectDB();
  await seedDatabase();

  const app = createBackendApp();
  const isProduction = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(process.cwd(), 'dist');

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusConnect server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CampusConnect server:', err);
  process.exit(1);
});
