import { query } from '../db/pool.js';
import type { Show, CreateShowInput, UpdateShowInput } from '@maycast/shared';

interface ShowRow {
  id: string;
  title: string;
  description: string;
  artworkKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export const showRepository = {
  async findAll(): Promise<Show[]> {
    const result = await query<ShowRow>(
      `SELECT id, title, description,
              artwork_key AS "artworkKey",
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM shows ORDER BY created_at DESC`,
    );
    return result.rows;
  },

  async findById(id: string): Promise<Show | null> {
    const result = await query<ShowRow>(
      `SELECT id, title, description,
              artwork_key AS "artworkKey",
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM shows WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async create(input: CreateShowInput): Promise<Show> {
    const result = await query<ShowRow>(
      `INSERT INTO shows (title, description, artwork_key)
       VALUES ($1, $2, $3)
       RETURNING id, title, description,
                 artwork_key AS "artworkKey",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      [input.title, input.description ?? '', input.artworkKey ?? null],
    );
    return result.rows[0];
  },

  async update(id: string, input: UpdateShowInput): Promise<Show | null> {
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
    if (input.artworkKey !== undefined) {
      fields.push(`artwork_key = $${idx++}`);
      values.push(input.artworkKey);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = now()`);
    values.push(id);

    const result = await query<ShowRow>(
      `UPDATE shows SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, title, description,
                 artwork_key AS "artworkKey",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      values,
    );
    return result.rows[0] ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM shows WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
