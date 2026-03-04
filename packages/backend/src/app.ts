import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { showsRouter } from './routes/shows.js';
import { episodesRouter } from './routes/episodes.js';
import { uploadRouter } from './routes/upload.js';
import { analyticsRouter } from './routes/analytics.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(morgan('dev'));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/shows', showsRouter);
  app.use('/api/episodes', episodesRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/analytics', analyticsRouter);

  app.use(errorHandler);

  return app;
}
