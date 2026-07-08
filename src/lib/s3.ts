import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

const region = process.env.AWS_REGION as string;
const bucket = process.env.S3_BUCKET as string;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

// Upload a file buffer, return its public URL.
// ponytail: assumes bucket serves objects publicly (or via CloudFront).
// Switch to a presigned GET if the bucket is private.
export async function uploadImage(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<string> {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const key = `profiles/${uuid()}.${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

// Delete by full URL (best-effort; ignores failures).
export async function deleteImage(url: string): Promise<void> {
  const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
  if (!url.startsWith(prefix)) return;
  const key = url.slice(prefix.length);
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    // ponytail: orphaned S3 object is harmless; skip retry logic
  }
}
