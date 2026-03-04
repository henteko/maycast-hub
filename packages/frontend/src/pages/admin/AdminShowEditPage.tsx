import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { ShowForm } from '../../components/admin/ShowForm.js';
import type { CreateShowInput, UpdateShowInput } from '@maycast/shared';
import styles from './Admin.module.css';

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

  if (!isNew && isLoading) return <p className={styles.loading}>読み込み中...</p>;

  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 28 }}>
        {isNew ? '番組を作成' : '番組を編集'}
      </h1>
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
