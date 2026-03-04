import { Router } from 'express';
import crypto from 'node:crypto';
import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyticsRouter = Router();

function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

// POST /api/analytics/play
analyticsRouter.post('/play', async (req, res, next) => {
  try {
    const { episodeId } = req.body;
    if (!episodeId) throw new AppError(400, 'episodeId is required');

    const userAgent = req.headers['user-agent'];
    const ip = req.ip ?? req.socket.remoteAddress;
    const ipHash = hashIp(ip);

    await analyticsRepository.recordPlay(episodeId, userAgent, ipHash);

    // Refresh materialized view in background (best-effort)
    analyticsRepository.refreshPlayCounts().catch(() => {});

    res.json({ data: { recorded: true } });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/episodes/:id
analyticsRouter.get('/episodes/:id', async (req, res, next) => {
  try {
    const stats = await analyticsRepository.getEpisodeStats(req.params.id);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/shows/:id
analyticsRouter.get('/shows/:id', async (req, res, next) => {
  try {
    const stats = await analyticsRepository.getShowStats(req.params.id);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});
