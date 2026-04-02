import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../config/r2';
import 'dotenv/config';

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;

export type MediaFolder = 'card-covers' | 'card-media' | 'campaign-materials' | 'avatars';

interface PresignParams {
  folder: MediaFolder;
  ownerId: string;         // user or transaction id for path namespacing
  fileName: string;
  contentType: string;
  expiresIn?: number;      // seconds, default 300
}

export async function generatePresignedUploadUrl(params: PresignParams) {
  const { folder, ownerId, fileName, contentType, expiresIn = 300 } = params;

  // Sanitize filename
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${folder}/${ownerId}/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
  const publicUrl = `${PUBLIC_DOMAIN}/${key}`;

  return { uploadUrl, publicUrl, key };
}
