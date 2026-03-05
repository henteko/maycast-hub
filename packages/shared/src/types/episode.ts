export type EpisodeStatus = 'draft' | 'published' | 'unpublished';

export interface EpisodeVideo {
  id: string;
  episodeId: string;
  videoKey: string;
  sortOrder: number;
  createdAt: string;
}

export interface Episode {
  id: string;
  showId: string;
  title: string;
  description: string;
  status: EpisodeStatus;
  audioKey: string | null;
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
  audioKey?: string;
  audioDuration?: number;
  videoKeys?: string[];
}

export interface UpdateEpisodeInput {
  title?: string;
  description?: string;
  audioKey?: string | null;
  audioDuration?: number | null;
  videoKeys?: string[];
}
