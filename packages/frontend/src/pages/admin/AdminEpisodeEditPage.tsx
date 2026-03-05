import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { EpisodeForm } from '../../components/admin/EpisodeForm.js';
import type { CreateEpisodeInput, UpdateEpisodeInput } from '@maycast/shared';

export function AdminEpisodeEditPage() {
  const { showId, episodeId } = useParams<{ showId: string; episodeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = episodeId === 'new';

  const { data: show } = useQuery({
    queryKey: ['shows', showId],
    queryFn: () => api.shows.get(showId!),
    enabled: !!showId,
  });

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

  if (!isNew && isLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[22px] font-bold tracking-[-0.01em]">
          {isNew ? 'エピソードを作成' : 'エピソードを編集'}
        </h1>
        <div className="flex gap-1 items-center mt-1">
          <Link to="/admin" className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline">
            番組一覧
          </Link>
          <span className="text-border text-[13px] leading-none">&gt;</span>
          <Link to={`/admin/shows/${showId}/episodes`} className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline">
            {show?.title ?? ''} - エピソード管理
          </Link>
        </div>
      </div>
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
