import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { EpisodeForm } from '../../components/admin/EpisodeForm.js';
import type { CreateEpisodeInput, UpdateEpisodeInput } from '@maycast/shared';

export function AdminEpisodeEditPage() {
  const { showId, episodeId } = useParams<{ showId: string; episodeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = episodeId === 'new';

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episodes', episodeId],
    queryFn: () => api.episodes.get(episodeId!),
    enabled: !isNew && !!episodeId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateEpisodeInput) => api.episodes.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes', showId] });
      navigate(`/admin/shows/${showId}/episodes`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateEpisodeInput) => api.episodes.update(episodeId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes', showId] });
      navigate(`/admin/shows/${showId}/episodes`);
    },
  });

  if (!isNew && isLoading) return <p>読み込み中...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>
        {isNew ? 'エピソードを作成' : 'エピソードを編集'}
      </h1>
      <EpisodeForm
        episode={isNew ? undefined : episode ?? undefined}
        showId={showId!}
        onSubmit={(input) => {
          if (isNew) {
            createMutation.mutate(input as CreateEpisodeInput);
          } else {
            updateMutation.mutate(input as UpdateEpisodeInput);
          }
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
