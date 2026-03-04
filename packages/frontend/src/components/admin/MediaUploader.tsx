import { useState, useRef } from 'react';
import { api } from '../../api/client.js';
import styles from './MediaUploader.module.css';

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
    <div className={styles.uploader}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className={styles.input}
      />
      {progress !== null && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <span className={styles.progressText}>{progress}%</span>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
