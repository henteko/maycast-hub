import { Router } from 'express';
import { storageService } from '../services/storageService.js';
import { AppError } from '../middleware/errorHandler.js';

export const uploadRouter = Router();

// POST /api/upload/presigned-url
uploadRouter.post('/presigned-url', async (req, res, next) => {
  try {
    const { filename, contentType, type } = req.body;
    if (!filename || !contentType || !type) {
      throw new AppError(400, 'filename, contentType, and type are required');
    }
    if (!['audio', 'video', 'image'].includes(type)) {
      throw new AppError(400, 'type must be audio, video, or image');
    }

    const result = await storageService.generatePresignedUrl(
      filename,
      contentType,
      type,
    );
    res.json({ data: result });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid content type')) {
      next(new AppError(400, err.message));
    } else {
      next(err);
    }
  }
});

// POST /api/upload/confirm
uploadRouter.post('/confirm', async (req, res, next) => {
  try {
    const { objectKey } = req.body;
    if (!objectKey) throw new AppError(400, 'objectKey is required');

    const exists = await storageService.confirmUpload(objectKey);
    if (!exists) throw new AppError(404, 'Object not found');

    res.json({ data: { confirmed: true } });
  } catch (err) {
    next(err);
  }
});
