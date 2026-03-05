import { query, transaction } from '../db/pool.js';
import type { Episode, EpisodeVideo, CreateEpisodeInput, UpdateEpisodeInput } from '@maycast/shared';

interface EpisodeRow {
  id: string;
  showId: string;
  title: string;
  description: string;
  status: string;
  audioKey: string | null;
  audioDuration: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VideoRow {
  id: string;
  episodeId: string;
  videoKey: string;
  sortOrder: number;
  createdAt: string;
}

const SELECT_FIELDS = `
  id, show_id AS "showId", title, description, status,
  audio_key AS "audioKey",
  audio_duration AS "audioDuration",
  published_at AS "publishedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const VIDEO_SELECT_FIELDS = `
  id, episode_id AS "episodeId", video_key AS "videoKey",
  sort_order AS "sortOrder", created_at AS "createdAt"
`;

async function attachVideos(episodes: EpisodeRow[]): Promise<Episode[]> {
  if (episodes.length === 0) return [];
  const ids = episodes.map((e) => e.id);
  const videoResult = await query<VideoRow>(
    `SELECT ${VIDEO_SELECT_FIELDS} FROM episode_videos
     WHERE episode_id = ANY($1)
     ORDER BY sort_order ASC, created_at ASC`,
    [ids],
  );
  const videoMap = new Map<string, EpisodeVideo[]>();
  for (const v of videoResult.rows) {
    const list = videoMap.get(v.episodeId) ?? [];
    list.push(v as EpisodeVideo);
    videoMap.set(v.episodeId, list);
  }
  return episodes.map((e) => ({
    ...e,
    videos: videoMap.get(e.id) ?? [],
  })) as Episode[];
}

async function attachVideosOne(row: EpisodeRow | undefined): Promise<Episode | null> {
  if (!row) return null;
  const results = await attachVideos([row]);
  return results[0];
}

async function insertVideos(
  client: { query: (text: string, params?: unknown[]) => Promise<unknown> },
  episodeId: string,
  videoKeys: string[],
): Promise<void> {
  for (let i = 0; i < videoKeys.length; i++) {
    await client.query(
      `INSERT INTO episode_videos (episode_id, video_key, sort_order) VALUES ($1, $2, $3)`,
      [episodeId, videoKeys[i], i],
    );
  }
}

export const episodeRepository = {
  async findByShowId(showId: string): Promise<Episode[]> {
    const result = await query<EpisodeRow>(
      `SELECT ${SELECT_FIELDS} FROM episodes
       WHERE show_id = $1 ORDER BY created_at DESC`,
      [showId],
    );
    return attachVideos(result.rows);
  },

  async findPublishedByShowId(showId: string): Promise<Episode[]> {
    const result = await query<EpisodeRow>(
      `SELECT ${SELECT_FIELDS} FROM episodes
       WHERE show_id = $1 AND status = 'published'
       ORDER BY published_at DESC`,
      [showId],
    );
    return attachVideos(result.rows);
  },

  async findById(id: string): Promise<Episode | null> {
    const result = await query<EpisodeRow>(
      `SELECT ${SELECT_FIELDS} FROM episodes WHERE id = $1`,
      [id],
    );
    return attachVideosOne(result.rows[0]);
  },

  async create(input: CreateEpisodeInput): Promise<Episode> {
    return transaction(async (client) => {
      const result = await client.query<EpisodeRow>(
        `INSERT INTO episodes (show_id, title, description, audio_key, audio_duration)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${SELECT_FIELDS}`,
        [
          input.showId,
          input.title,
          input.description ?? '',
          input.audioKey ?? null,
          input.audioDuration ?? null,
        ],
      );
      const row = result.rows[0];
      if (input.videoKeys && input.videoKeys.length > 0) {
        await insertVideos(client, row.id, input.videoKeys);
      }
      // Fetch with videos
      const episodeResult = await client.query<EpisodeRow>(
        `SELECT ${SELECT_FIELDS} FROM episodes WHERE id = $1`,
        [row.id],
      );
      const videoResult = await client.query<VideoRow>(
        `SELECT ${VIDEO_SELECT_FIELDS} FROM episode_videos WHERE episode_id = $1 ORDER BY sort_order ASC`,
        [row.id],
      );
      return {
        ...episodeResult.rows[0],
        videos: videoResult.rows as EpisodeVideo[],
      } as Episode;
    });
  },

  async update(id: string, input: UpdateEpisodeInput): Promise<Episode | null> {
    return transaction(async (client) => {
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
      if (input.audioKey !== undefined) {
        fields.push(`audio_key = $${idx++}`);
        values.push(input.audioKey);
      }
      if (input.audioDuration !== undefined) {
        fields.push(`audio_duration = $${idx++}`);
        values.push(input.audioDuration);
      }

      if (fields.length > 0) {
        fields.push(`updated_at = now()`);
        values.push(id);
        await client.query(
          `UPDATE episodes SET ${fields.join(', ')} WHERE id = $${idx}`,
          values,
        );
      }

      // Replace videos if provided
      if (input.videoKeys !== undefined) {
        await client.query(`DELETE FROM episode_videos WHERE episode_id = $1`, [id]);
        if (input.videoKeys.length > 0) {
          await insertVideos(client, id, input.videoKeys);
        }
      }

      // Return updated episode with videos
      const episodeResult = await client.query<EpisodeRow>(
        `SELECT ${SELECT_FIELDS} FROM episodes WHERE id = $1`,
        [id],
      );
      if (episodeResult.rows.length === 0) return null;
      const videoResult = await client.query<VideoRow>(
        `SELECT ${VIDEO_SELECT_FIELDS} FROM episode_videos WHERE episode_id = $1 ORDER BY sort_order ASC`,
        [id],
      );
      return {
        ...episodeResult.rows[0],
        videos: videoResult.rows as EpisodeVideo[],
      } as Episode;
    });
  },

  async publish(id: string): Promise<Episode | null> {
    const result = await query<EpisodeRow>(
      `UPDATE episodes SET status = 'published', published_at = now(), updated_at = now()
       WHERE id = $1 RETURNING ${SELECT_FIELDS}`,
      [id],
    );
    return attachVideosOne(result.rows[0]);
  },

  async unpublish(id: string): Promise<Episode | null> {
    const result = await query<EpisodeRow>(
      `UPDATE episodes SET status = 'unpublished', updated_at = now()
       WHERE id = $1 RETURNING ${SELECT_FIELDS}`,
      [id],
    );
    return attachVideosOne(result.rows[0]);
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM episodes WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
