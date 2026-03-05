import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import crypto from 'node:crypto';

const s3Config = {
  region: env.s3.region,
  credentials: {
    accessKeyId: env.s3.accessKey,
    secretAccessKey: env.s3.secretKey,
  },
  forcePathStyle: env.s3.forcePathStyle,
  requestChecksumCalculation: 'WHEN_REQUIRED' as const,
  responseChecksumValidation: 'WHEN_REQUIRED' as const,
};

const s3 = new S3Client({ ...s3Config, endpoint: env.s3.endpoint });

const ALLOWED_CONTENT_TYPES: Record<string, string[]> = {
  audio: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm'],
  video: ['video/mp4', 'video/webm'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
};

export const storageService = {
  async generatePresignedUrl(
    filename: string,
    contentType: string,
    type: 'audio' | 'video' | 'image',
  ): Promise<{ uploadUrl: string; objectKey: string }> {
    const allowed = ALLOWED_CONTENT_TYPES[type];
    if (!allowed?.includes(contentType)) {
      throw new Error(`Invalid content type: ${contentType} for type: ${type}`);
    }

    const ext = filename.split('.').pop() ?? '';
    const objectKey = `${type}/${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: objectKey,
    });

    const internalUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
    const uploadUrl = env.s3.publicEndpoint
      ? internalUrl.replace(env.s3.endpoint, env.s3.publicEndpoint)
      : internalUrl;

    return { uploadUrl, objectKey };
  },

  async confirmUpload(objectKey: string): Promise<boolean> {
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: env.s3.bucket,
          Key: objectKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  },
};
