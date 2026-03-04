export interface Show {
  id: string;
  title: string;
  description: string;
  artworkUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShowInput {
  title: string;
  description?: string;
  artworkUrl?: string;
}

export interface UpdateShowInput {
  title?: string;
  description?: string;
  artworkUrl?: string | null;
}
