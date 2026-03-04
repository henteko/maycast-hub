function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  port: parseInt(optional('PORT', '3001'), 10),
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  s3: {
    endpoint: required('S3_ENDPOINT'),
    publicEndpoint: optional('S3_PUBLIC_ENDPOINT', ''),
    accessKey: required('S3_ACCESS_KEY'),
    secretKey: required('S3_SECRET_KEY'),
    bucket: required('S3_BUCKET'),
    region: optional('S3_REGION', 'us-east-1'),
    forcePathStyle: optional('S3_FORCE_PATH_STYLE', 'true') === 'true',
  },
  mediaBaseUrl: required('MEDIA_BASE_URL'),
} as const;
