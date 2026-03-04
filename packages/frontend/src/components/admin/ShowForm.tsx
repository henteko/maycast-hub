import { useState } from 'react';
import type { Show, CreateShowInput, UpdateShowInput } from '@maycast/shared';
import { MediaUploader } from './MediaUploader.js';

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
        <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.04em]">アートワーク</label>
        {artworkUrl && (
          <img src={artworkUrl} alt="artwork" className="w-[120px] h-[120px] object-cover rounded-[var(--theme-radius)] border border-border" />
        )}
        <MediaUploader
          type="image"
          accept="image/jpeg,image/png,image/webp"
          onUploaded={(url) => setArtworkUrl(url)}
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
