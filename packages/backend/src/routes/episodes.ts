import { Router } from 'express';
import { episodeRepository } from '../repositories/episodeRepository.js';
import { AppError } from '../middleware/errorHandler.js';

export const episodesRouter = Router();

// GET /api/episodes/:id
episodesRouter.get('/:id', async (req, res, next) => {
  try {
    const episode = await episodeRepository.findById(req.params.id);
    if (!episode) throw new AppError(404, 'Episode not found');
    res.json({ data: episode });
  } catch (err) {
    next(err);
  }
});

// POST /api/episodes
episodesRouter.post('/', async (req, res, next) => {
  try {
    const { showId, title, description, audioUrl, audioDuration, videoUrls } = req.body;
    if (!showId) throw new AppError(400, 'showId is required');
    if (!title) throw new AppError(400, 'title is required');
    const episode = await episodeRepository.create({
      showId,
      title,
      description,
      audioUrl,
      audioDuration,
      videoUrls,
    });
    res.status(201).json({ data: episode });
  } catch (err) {
    next(err);
  }
});

// PUT /api/episodes/:id
episodesRouter.put('/:id', async (req, res, next) => {
  try {
    const { title, description, audioUrl, audioDuration, videoUrls } = req.body;
    const episode = await episodeRepository.update(req.params.id, {
      title,
      description,
      audioUrl,
      audioDuration,
      videoUrls,
    });
    if (!episode) throw new AppError(404, 'Episode not found');
    res.json({ data: episode });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/episodes/:id/publish
episodesRouter.patch('/:id/publish', async (req, res, next) => {
  try {
    const episode = await episodeRepository.publish(req.params.id);
    if (!episode) throw new AppError(404, 'Episode not found');
    res.json({ data: episode });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/episodes/:id/unpublish
episodesRouter.patch('/:id/unpublish', async (req, res, next) => {
  try {
    const episode = await episodeRepository.unpublish(req.params.id);
    if (!episode) throw new AppError(404, 'Episode not found');
    res.json({ data: episode });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/episodes/:id
episodesRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await episodeRepository.delete(req.params.id);
    if (!deleted) throw new AppError(404, 'Episode not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
