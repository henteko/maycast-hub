import { Router } from 'express';
import { showRepository } from '../repositories/showRepository.js';
import { episodeRepository } from '../repositories/episodeRepository.js';
export const ogpRouter = Router();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ogpImageUrl(origin: string, key: string): string {
  return `${origin}/ogp-media/${key}`;
}

function renderOgpHtml(opts: {
  title: string;
  description: string;
  image?: string;
  url: string;
}): string {
  const lines = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="utf-8" />',
    `<meta property="og:title" content="${escapeHtml(opts.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(opts.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escapeHtml(opts.url)}" />`,
  ];
  if (opts.image) {
    lines.push(`<meta property="og:image" content="${escapeHtml(opts.image)}" />`);
  }
  lines.push('</head><body></body></html>');
  return lines.join('\n');
}

// GET /api/ogp/shows/:id
ogpRouter.get('/shows/:id', async (req, res, next) => {
  try {
    const show = await showRepository.findById(req.params.id);
    if (!show) {
      res.status(404).send('Not found');
      return;
    }

    const origin = `${req.protocol}://${req.get('host')}`;
    const html = renderOgpHtml({
      title: show.title,
      description: show.description || '',
      image: show.artworkKey ? ogpImageUrl(origin, show.artworkKey) : undefined,
      url: `${origin}/shows/${show.id}`,
    });
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
});

// GET /api/ogp/shows/:showId/episodes/:episodeId
ogpRouter.get('/shows/:showId/episodes/:episodeId', async (req, res, next) => {
  try {
    const show = await showRepository.findById(req.params.showId);
    const episode = await episodeRepository.findById(req.params.episodeId);
    if (!show || !episode) {
      res.status(404).send('Not found');
      return;
    }

    const origin = `${req.protocol}://${req.get('host')}`;
    const html = renderOgpHtml({
      title: `${episode.title} - ${show.title}`,
      description: episode.description || show.description || '',
      image: show.artworkKey ? ogpImageUrl(origin, show.artworkKey) : undefined,
      url: `${origin}/shows/${show.id}/episodes/${episode.id}`,
    });
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
});
