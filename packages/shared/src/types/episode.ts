export type EpisodeStatus = 'draft' | 'published' | 'unpublished';

export interface Episode {
  id: string;
  showId: string;
  title: string;
  description: string;
  status: EpisodeStatus;
  audioUrl: string | null;
  audioDuration: number | null;
  videoUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEpisodeInput {
  showId: string;
  title: string;
  description?: string;
  audioUrl?: string;
  audioDuration?: number;
  videoUrl?: string;
}

export interface UpdateEpisodeInput {
  title?: string;
  description?: string;
  audioUrl?: string | null;
  audioDuration?: number | null;
  videoUrl?: string | null;
}
