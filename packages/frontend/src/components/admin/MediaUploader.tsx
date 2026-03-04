import { useState, useRef } from 'react';
import { api } from '../../api/client.js';

interface Props {
  type: 'audio' | 'video' | 'image';
  accept: string;
  onUploaded: (publicUrl: string, duration?: number) => void;
}

function getMediaDuration(file: File, mediaType: 'audio' | 'video'): Promise<number> {
  return new Promise((resolve, reject) => {
    const el = document.createElement(mediaType);
    el.preload = 'metadata';
    const url = URL.createObjectURL(file);
    el.src = url;
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(el.duration));
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read media duration'));
    };
  });
}

export function MediaUploader({ type, accept, onUploaded }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    try {
      // Get presigned URL
      const { uploadUrl, objectKey, publicUrl } =
        await api.upload.getPresignedUrl({
          filename: file.name,
          contentType: file.type,
          type,
        });

      // Upload directly to S3/MinIO
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(file);
      });

      // Confirm upload
      await api.upload.confirm(objectKey);

      // Extract duration for audio/video files
      let duration: number | undefined;
      if (type === 'audio' || type === 'video') {
        try {
          duration = await getMediaDuration(file, type);
        } catch {
          // Duration extraction is best-effort
        }
      }

      setProgress(null);
      onUploaded(publicUrl, duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(null);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="text-sm text-text-secondary file:px-3.5 file:py-1.5 file:border file:border-border file:rounded-[var(--theme-radius-sm)] file:bg-surface file:text-text file:text-[13px] file:font-medium file:cursor-pointer file:mr-2.5 file:transition-colors file:duration-150 hover:file:bg-bg"
      />
      {progress !== null && (
        <div className="relative h-7 bg-bg rounded-[var(--theme-radius-sm)] overflow-hidden border border-border">
          <div className="h-full bg-primary transition-[width] duration-200 opacity-85" style={{ width: `${progress}%` }} />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-text tabular-nums">{progress}%</span>
        </div>
      )}
      {error && <p className="text-[13px] text-danger font-medium">{error}</p>}
    </div>
  );
}
