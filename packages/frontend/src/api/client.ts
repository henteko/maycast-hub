import type {
  Show,
  Episode,
  CreateShowInput,
  UpdateShowInput,
  CreateEpisodeInput,
  UpdateEpisodeInput,
  PresignedUrlRequest,
  PresignedUrlResponse,
  EpisodePlayCount,
  ShowAnalytics,
  ApiResponse,
} from '@maycast/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// Shows
export const api = {
  shows: {
    list: () => fetchApi<Show[]>('/api/shows'),
    get: (id: string) => fetchApi<Show>(`/api/shows/${id}`),
    create: (input: CreateShowInput) =>
      fetchApi<Show>('/api/shows', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, input: UpdateShowInput) =>
      fetchApi<Show>(`/api/shows/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    delete: (id: string) =>
      fetchApi<void>(`/api/shows/${id}`, { method: 'DELETE' }),
  },

  episodes: {
    listByShow: (showId: string, admin = false) =>
      fetchApi<Episode[]>(`/api/shows/${showId}/episodes${admin ? '?admin=true' : ''}`),
    get: (id: string) => fetchApi<Episode>(`/api/episodes/${id}`),
    create: (input: CreateEpisodeInput) =>
      fetchApi<Episode>('/api/episodes', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, input: UpdateEpisodeInput) =>
      fetchApi<Episode>(`/api/episodes/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    publish: (id: string) =>
      fetchApi<Episode>(`/api/episodes/${id}/publish`, { method: 'PATCH' }),
    unpublish: (id: string) =>
      fetchApi<Episode>(`/api/episodes/${id}/unpublish`, { method: 'PATCH' }),
    delete: (id: string) =>
      fetchApi<void>(`/api/episodes/${id}`, { method: 'DELETE' }),
  },

  upload: {
    getPresignedUrl: (input: PresignedUrlRequest) =>
      fetchApi<PresignedUrlResponse>('/api/upload/presigned-url', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    confirm: (objectKey: string) =>
      fetchApi<{ confirmed: boolean }>('/api/upload/confirm', {
        method: 'POST',
        body: JSON.stringify({ objectKey }),
      }),
  },

  analytics: {
    recordPlay: (episodeId: string) =>
      fetchApi<{ recorded: boolean }>('/api/analytics/play', {
        method: 'POST',
        body: JSON.stringify({ episodeId }),
      }),
    episodeStats: (id: string) =>
      fetchApi<EpisodePlayCount>(`/api/analytics/episodes/${id}`),
    showStats: (id: string) =>
      fetchApi<ShowAnalytics>(`/api/analytics/shows/${id}`),
  },
};
