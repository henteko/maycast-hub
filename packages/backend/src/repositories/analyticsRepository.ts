import { query } from '../db/pool.js';
import type { EpisodePlayCount } from '@maycast/shared';

interface PlayCountRow {
  episodeId: string;
  episodeTitle: string;
  totalPlays: string;
  uniqueListeners: string;
}

export const analyticsRepository = {
  async recordPlay(
    episodeId: string,
    userAgent: string | undefined,
    ipHash: string | undefined,
    userEmail: string | undefined,
  ): Promise<void> {
    await query(
      `INSERT INTO play_events (episode_id, user_agent, ip_hash, user_email) VALUES ($1, $2, $3, $4)`,
      [episodeId, userAgent ?? null, ipHash ?? null, userEmail ?? null],
    );
  },

  async getEpisodeStats(episodeId: string): Promise<EpisodePlayCount> {
    // Fall back to direct count if materialized view is empty
    const result = await query<PlayCountRow>(
      `SELECT episode_id AS "episodeId",
              COALESCE(total_plays, 0) AS "totalPlays",
              COALESCE(unique_listeners, 0) AS "uniqueListeners"
       FROM episode_play_counts WHERE episode_id = $1`,
      [episodeId],
    );

    if (result.rows[0]) {
      return {
        episodeId: result.rows[0].episodeId,
        totalPlays: Number(result.rows[0].totalPlays),
        uniqueListeners: Number(result.rows[0].uniqueListeners),
      };
    }

    // Fallback: direct query
    const fallback = await query<PlayCountRow>(
      `SELECT $1::uuid AS "episodeId",
              COUNT(*)::text AS "totalPlays",
              COUNT(DISTINCT ip_hash)::text AS "uniqueListeners"
       FROM play_events WHERE episode_id = $1`,
      [episodeId],
    );
    const row = fallback.rows[0];
    return {
      episodeId,
      totalPlays: Number(row.totalPlays),
      uniqueListeners: Number(row.uniqueListeners),
    };
  },

  async getShowStats(
    showId: string,
  ): Promise<{ totalPlays: number; uniqueListeners: number; episodes: EpisodePlayCount[] }> {
    const result = await query<PlayCountRow>(
      `SELECT e.id AS "episodeId",
              e.title AS "episodeTitle",
              COALESCE(p.total_plays, 0)::text AS "totalPlays",
              COALESCE(p.unique_listeners, 0)::text AS "uniqueListeners"
       FROM episodes e
       LEFT JOIN episode_play_counts p ON p.episode_id = e.id
       WHERE e.show_id = $1
       ORDER BY e.created_at DESC`,
      [showId],
    );

    const episodes: EpisodePlayCount[] = result.rows.map((r) => ({
      episodeId: r.episodeId,
      episodeTitle: r.episodeTitle,
      totalPlays: Number(r.totalPlays),
      uniqueListeners: Number(r.uniqueListeners),
    }));

    const totalPlays = episodes.reduce((s, e) => s + e.totalPlays, 0);
    const uniqueListeners = episodes.reduce((s, e) => s + e.uniqueListeners, 0);

    return { totalPlays, uniqueListeners, episodes };
  },

  async refreshPlayCounts(): Promise<void> {
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY episode_play_counts');
  },
};
