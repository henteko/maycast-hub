import { useState } from 'react';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@maycast/shared';
import { MediaUploader } from './MediaUploader.js';

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
  const [videoUrls, setVideoUrls] = useState<string[]>(
    episode?.videos.map((v) => v.videoUrl) ?? [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (episode) {
      onSubmit({
        title,
        description,
        audioUrl: audioUrl || null,
        audioDuration,
        videoUrls,
      } satisfies UpdateEpisodeInput);
    } else {
      onSubmit({
        showId,
        title,
        description,
        audioUrl: audioUrl || undefined,
        audioDuration: audioDuration ?? undefined,
        videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      } satisfies CreateEpisodeInput);
    }
  };

  const moveVideo = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= videoUrls.length) return;
    const newUrls = [...videoUrls];
    [newUrls[index], newUrls[newIndex]] = [newUrls[newIndex], newUrls[index]];
    setVideoUrls(newUrls);
  };

  const removeVideo = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  return (
    <form className="flex flex-col gap-[22px] max-w-[600px]" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.04em]">タイトル *</label>
        <input
          className="px-3.5 py-2.5 border border-border rounded-[var(--theme-radius)] text-sm bg-surface text-text transition-all duration-150 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-subtle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.04em]">説明</label>
        <textarea
          className="px-3.5 py-2.5 border border-border rounded-[var(--theme-radius)] text-sm bg-surface text-text transition-all duration-150 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-subtle resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.04em]">音声ファイル</label>
        {audioUrl && <p className="text-xs text-text-secondary break-all font-mono bg-bg px-2.5 py-1.5 rounded-[var(--theme-radius-sm)]">{audioUrl}</p>}
        {audioDuration != null && (
          <p className="text-xs text-text-secondary break-all font-mono bg-bg px-2.5 py-1.5 rounded-[var(--theme-radius-sm)]">
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

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.04em]">動画ファイル（プロモーション用）</label>
        {videoUrls.length > 0 && (
          <div className="flex flex-col gap-2">
            {videoUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2 bg-bg px-2.5 py-1.5 rounded-[var(--theme-radius-sm)]">
                <span className="text-xs text-text-secondary break-all font-mono flex-1 min-w-0 truncate">{url}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-transparent border border-border rounded text-text-secondary text-xs hover:bg-surface disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    onClick={() => moveVideo(index, -1)}
                    disabled={index === 0}
                    title="上へ"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-transparent border border-border rounded text-text-secondary text-xs hover:bg-surface disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    onClick={() => moveVideo(index, 1)}
                    disabled={index === videoUrls.length - 1}
                    title="下へ"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-transparent border border-border rounded text-red-500 text-xs hover:bg-red-50 cursor-pointer"
                    onClick={() => removeVideo(index)}
                    title="削除"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <MediaUploader
          type="video"
          accept="video/mp4,video/webm"
          onUploaded={(url) => setVideoUrls([...videoUrls, url])}
        />
      </div>

      <button
        className="self-start px-7 py-2.5 bg-primary text-white border-none rounded-[var(--theme-radius)] font-semibold text-sm transition-colors duration-150 hover:not-disabled:bg-primary-hover disabled:opacity-50"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
