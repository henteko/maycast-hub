import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { ShowForm } from '../../components/admin/ShowForm.js';
import type { CreateShowInput, UpdateShowInput } from '@maycast/shared';

export function AdminShowEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const { data: show, isLoading } = useQuery({
    queryKey: ['shows', id],
    queryFn: () => api.shows.get(id!),
    enabled: !isNew && !!id,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateShowInput) => api.shows.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      navigate('/admin');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateShowInput) => api.shows.update(id!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      navigate('/admin');
    },
  });

  if (!isNew && isLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[22px] font-bold tracking-[-0.01em]">
          {isNew ? '番組を作成' : `${show?.title ?? ''} - 編集`}
        </h1>
        <Link to="/admin" className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline">
          &#8592; 番組一覧に戻る
        </Link>
      </div>
      <ShowForm
        show={isNew ? undefined : show ?? undefined}
        onSubmit={(input) => {
          if (isNew) {
            createMutation.mutate(input as CreateShowInput);
          } else {
            updateMutation.mutate(input as UpdateShowInput);
          }
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
