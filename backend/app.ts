import path from 'path';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.ts';
import announcementRoutes from './routes/announcementRoutes.ts';
import complaintRoutes from './routes/complaintRoutes.ts';
import eventRoutes from './routes/eventRoutes.ts';
import lostFoundRoutes from './routes/lostFoundRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';
import { notFound, errorHandler } from './middleware/errorMiddleware.ts';

export const createBackendApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded complaint and lost-found images
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'CampusConnect API' });
  });

  // REST API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/lost-found', lostFoundRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
