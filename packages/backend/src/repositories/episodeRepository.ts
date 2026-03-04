import { query } from '../db/pool.js';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@maycast/shared';

interface EpisodeRow {
  id: string;
  showId: string;
  title: string;
  description: string;
  status: string;
  audioUrl: string | null;
  audioDuration: number | null;
  videoUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const SELECT_FIELDS = `
  id, show_id AS "showId", title, description, status,
  audio_url AS "audioUrl",
  audio_duration AS "audioDuration",
  video_url AS "videoUrl",
  published_at AS "publishedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export const episodeRepository = {
  async findByShowId(showId: string): Promise<Episode[]> {
    const result = await query<EpisodeRow>(
      `SELECT ${SELECT_FIELDS} FROM episodes
       WHERE show_id = $1 ORDER BY created_at DESC`,
      [showId],
    );
    return result.rows as Episode[];
  },

  async findPublishedByShowId(showId: string): Promise<Episode[]> {
    const result = await query<EpisodeRow>(
      `SELECT ${SELECT_FIELDS} FROM episodes
       WHERE show_id = $1 AND status = 'published'
       ORDER BY published_at DESC`,
      [showId],
    );
    return result.rows as Episode[];
  },

  async findById(id: string): Promise<Episode | null> {
    const result = await query<EpisodeRow>(
      `SELECT ${SELECT_FIELDS} FROM episodes WHERE id = $1`,
      [id],
    );
    return (result.rows[0] as Episode) ?? null;
  },

  async create(input: CreateEpisodeInput): Promise<Episode> {
    const result = await query<EpisodeRow>(
      `INSERT INTO episodes (show_id, title, description, audio_url, audio_duration, video_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_FIELDS}`,
      [
        input.showId,
        input.title,
        input.description ?? '',
        input.audioUrl ?? null,
        input.audioDuration ?? null,
        input.videoUrl ?? null,
      ],
    );
    return result.rows[0] as Episode;
  },

  async update(id: string, input: UpdateEpisodeInput): Promise<Episode | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(input.title);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(input.description);
    }
    if (input.audioUrl !== undefined) {
      fields.push(`audio_url = $${idx++}`);
      values.push(input.audioUrl);
    }
    if (input.audioDuration !== undefined) {
      fields.push(`audio_duration = $${idx++}`);
      values.push(input.audioDuration);
    }
    if (input.videoUrl !== undefined) {
      fields.push(`video_url = $${idx++}`);
      values.push(input.videoUrl);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = now()`);
    values.push(id);

    const result = await query<EpisodeRow>(
      `UPDATE episodes SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING ${SELECT_FIELDS}`,
      values,
    );
    return (result.rows[0] as Episode) ?? null;
  },

  async publish(id: string): Promise<Episode | null> {
    const result = await query<EpisodeRow>(
      `UPDATE episodes SET status = 'published', published_at = now(), updated_at = now()
       WHERE id = $1 RETURNING ${SELECT_FIELDS}`,
      [id],
    );
    return (result.rows[0] as Episode) ?? null;
  },

  async unpublish(id: string): Promise<Episode | null> {
    const result = await query<EpisodeRow>(
      `UPDATE episodes SET status = 'unpublished', updated_at = now()
       WHERE id = $1 RETURNING ${SELECT_FIELDS}`,
      [id],
    );
    return (result.rows[0] as Episode) ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM episodes WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
