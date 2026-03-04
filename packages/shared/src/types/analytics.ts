export interface PlayEvent {
  episodeId: string;
  userAgent?: string;
}

export interface EpisodePlayCount {
  episodeId: string;
  totalPlays: number;
  uniqueListeners: number;
}

export interface ShowAnalytics {
  showId: string;
  totalPlays: number;
  uniqueListeners: number;
  episodes: EpisodePlayCount[];
}
