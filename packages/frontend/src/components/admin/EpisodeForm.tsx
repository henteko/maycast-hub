import { useState } from 'react';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@maycast/shared';
import { MediaUploader } from './MediaUploader.js';
import { mediaUrl } from '../../utils/media.js';

interface Props {
  episode?: Episode;
  showId: string;
  onSubmit: (input: CreateEpisodeInput | UpdateEpisodeInput) => void;
  isSubmitting: boolean;
}

export function EpisodeForm({ episode, showId, onSubmit, isSubmitting }: Props) {
  const [title, setTitle] = useState(episode?.title ?? '');
  const [description, setDescription] = useState(episode?.description ?? '');
  const [audioKey, setAudioKey] = useState(episode?.audioKey ?? '');
  const [audioDuration, setAudioDuration] = useState<number | null>(episode?.audioDuration ?? null);
  const [videoKeys, setVideoKeys] = useState<string[]>(
    episode?.videos.map((v) => v.videoKey) ?? [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (episode) {
      onSubmit({
        title,
        description,
        audioKey: audioKey || null,
        audioDuration,
        videoKeys,
      } satisfies UpdateEpisodeInput);
    } else {
      onSubmit({
        showId,
        title,
        description,
        audioKey: audioKey || undefined,
        audioDuration: audioDuration ?? undefined,
        videoKeys: videoKeys.length > 0 ? videoKeys : undefined,
      } satisfies CreateEpisodeInput);
    }
  };

  const moveVideo = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= videoKeys.length) return;
    const newKeys = [...videoKeys];
    [newKeys[index], newKeys[newIndex]] = [newKeys[newIndex], newKeys[index]];
    setVideoKeys(newKeys);
  };

  const removeVideo = (index: number) => {
    setVideoKeys(videoKeys.filter((_, i) => i !== index));
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
        {audioKey && (
          <div className="bg-bg px-2.5 py-2 rounded-[var(--theme-radius-sm)] flex flex-col gap-1.5">
            <audio controls src={mediaUrl(audioKey)} className="w-full h-8" />
            <p className="text-xs text-text-secondary break-all font-mono m-0">{audioKey}</p>
            {audioDuration != null && (
              <p className="text-xs text-text-secondary font-mono m-0">
                長さ: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>
        )}
        <MediaUploader
          type="audio"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg"
          onUploaded={(key, duration) => {
            setAudioKey(key);
            if (duration != null) setAudioDuration(duration);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.04em]">動画ファイル（プロモーション用）</label>
        {videoKeys.length > 0 && (
          <div className="flex flex-col gap-2">
            {videoKeys.map((key, index) => (
              <div key={index} className="bg-bg px-2.5 py-2 rounded-[var(--theme-radius-sm)] flex flex-col gap-1.5">
                <video controls src={mediaUrl(key)} className="w-full max-h-[200px] rounded-[var(--theme-radius-sm)] bg-black" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary break-all font-mono flex-1 min-w-0 truncate">{key}</span>
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
                    disabled={index === videoKeys.length - 1}
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
              </div>
            ))}
          </div>
        )}
        <MediaUploader
          type="video"
          accept="video/mp4,video/webm"
          onUploaded={(key) => setVideoKeys([...videoKeys, key])}
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
