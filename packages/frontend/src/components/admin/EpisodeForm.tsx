import { useState } from 'react';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@maycast/shared';
import { MediaUploader } from './MediaUploader.js';
import styles from './EpisodeForm.module.css';

interface Props {
  episode?: Episode;
  showId: string;
  onSubmit: (input: CreateEpisodeInput | UpdateEpisodeInput) => void;
  isSubmitting: boolean;
}

export function EpisodeForm({ episode, showId, onSubmit, isSubmitting }: Props) {
  const [title, setTitle] = useState(episode?.title ?? '');
  const [description, setDescription] = useState(episode?.description ?? '');
  const [audioUrl, setAudioUrl] = useState(episode?.audioUrl ?? '');
  const [audioDuration, setAudioDuration] = useState<number | null>(episode?.audioDuration ?? null);
  const [videoUrl, setVideoUrl] = useState(episode?.videoUrl ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (episode) {
      onSubmit({
        title,
        description,
        audioUrl: audioUrl || null,
        audioDuration,
        videoUrl: videoUrl || null,
      } satisfies UpdateEpisodeInput);
    } else {
      onSubmit({
        showId,
        title,
        description,
        audioUrl: audioUrl || undefined,
        audioDuration: audioDuration ?? undefined,
        videoUrl: videoUrl || undefined,
      } satisfies CreateEpisodeInput);
    }
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
        <label className={styles.label}>音声ファイル</label>
        {audioUrl && <p className={styles.fileUrl}>{audioUrl}</p>}
        {audioDuration != null && (
          <p className={styles.fileUrl}>
            長さ: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
          </p>
        )}
        <MediaUploader
          type="audio"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg"
          onUploaded={(url, duration) => {
            setAudioUrl(url);
            if (duration != null) setAudioDuration(duration);
          }}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>動画ファイル（プロモーション用）</label>
        {videoUrl && <p className={styles.fileUrl}>{videoUrl}</p>}
        <MediaUploader
          type="video"
          accept="video/mp4,video/webm"
          onUploaded={(url) => setVideoUrl(url)}
        />
      </div>

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
