import { useState } from 'react';
import type { Show, CreateShowInput, UpdateShowInput } from '@maycast/shared';
import { MediaUploader } from './MediaUploader.js';
import styles from './ShowForm.module.css';

interface Props {
  show?: Show;
  onSubmit: (input: CreateShowInput | UpdateShowInput) => void;
  isSubmitting: boolean;
}

export function ShowForm({ show, onSubmit, isSubmitting }: Props) {
  const [title, setTitle] = useState(show?.title ?? '');
  const [description, setDescription] = useState(show?.description ?? '');
  const [artworkUrl, setArtworkUrl] = useState(show?.artworkUrl ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, artworkUrl: artworkUrl || undefined });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>タイトル *</label>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>説明</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>アートワーク</label>
        {artworkUrl && (
          <img src={artworkUrl} alt="artwork" className={styles.preview} />
        )}
        <MediaUploader
          type="image"
          accept="image/jpeg,image/png,image/webp"
          onUploaded={(url) => setArtworkUrl(url)}
        />
      </div>

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
