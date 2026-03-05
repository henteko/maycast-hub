import { Router } from 'express';
import { showRepository } from '../repositories/showRepository.js';
import { episodeRepository } from '../repositories/episodeRepository.js';
import { AppError } from '../middleware/errorHandler.js';

export const showsRouter = Router();

// GET /api/shows
showsRouter.get('/', async (_req, res, next) => {
  try {
    const shows = await showRepository.findAll();
    res.json({ data: shows });
  } catch (err) {
    next(err);
  }
});

// GET /api/shows/:id
showsRouter.get('/:id', async (req, res, next) => {
  try {
    const show = await showRepository.findById(req.params.id);
    if (!show) throw new AppError(404, 'Show not found');
    res.json({ data: show });
  } catch (err) {
    next(err);
  }
});

// POST /api/shows
showsRouter.post('/', async (req, res, next) => {
  try {
    const { title, description, artworkKey } = req.body;
    if (!title) throw new AppError(400, 'title is required');
    const show = await showRepository.create({ title, description, artworkKey });
    res.status(201).json({ data: show });
  } catch (err) {
    next(err);
  }
});

// PUT /api/shows/:id
showsRouter.put('/:id', async (req, res, next) => {
  try {
    const { title, description, artworkKey } = req.body;
    const show = await showRepository.update(req.params.id, { title, description, artworkKey });
    if (!show) throw new AppError(404, 'Show not found');
    res.json({ data: show });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/shows/:id
showsRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await showRepository.delete(req.params.id);
    if (!deleted) throw new AppError(404, 'Show not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/shows/:showId/episodes
showsRouter.get('/:showId/episodes', async (req, res, next) => {
  try {
    const { showId } = req.params;
    const show = await showRepository.findById(showId);
    if (!show) throw new AppError(404, 'Show not found');

    const admin = req.query.admin === 'true';
    const episodes = admin
      ? await episodeRepository.findByShowId(showId)
      : await episodeRepository.findPublishedByShowId(showId);
    res.json({ data: episodes });
  } catch (err) {
    next(err);
  }
});
