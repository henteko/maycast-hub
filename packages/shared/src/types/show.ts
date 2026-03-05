export interface Show {
  id: string;
  title: string;
  description: string;
  artworkKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShowInput {
  title: string;
  description?: string;
  artworkKey?: string;
}

export interface UpdateShowInput {
  title?: string;
  description?: string;
  artworkKey?: string | null;
}
