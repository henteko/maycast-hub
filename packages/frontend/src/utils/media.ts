export function mediaUrl(objectKey: string | null | undefined): string {
  if (!objectKey) return '';
  if (objectKey.startsWith('/') || objectKey.startsWith('http')) return objectKey;
  return `/media/${objectKey}`;
}
