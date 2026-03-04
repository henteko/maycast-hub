export type EpisodeStatus = 'draft' | 'published' | 'unpublished';

export interface EpisodeVideo {
  id: string;
  episodeId: string;
  videoUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface Episode {
  id: string;
  showId: string;
  title: string;
  description: string;
  status: EpisodeStatus;
  audioUrl: string | null;
  audioDuration: number | null;
  videos: EpisodeVideo[];
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
  videoUrls?: string[];
}

export interface UpdateEpisodeInput {
  title?: string;
  description?: string;
  audioUrl?: string | null;
  audioDuration?: number | null;
  videoUrls?: string[];
}
