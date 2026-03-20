import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { firebaseAdminStorage } from './firebase-admin.js';

const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const bucket = firebaseAdminStorage.bucket();

function createSafeFilename(originalname) {
  const safeBaseName = path
    .basename(originalname, path.extname(originalname))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  const extension = path.extname(originalname).toLowerCase() || '.jpg';
  return `${Date.now()}-${randomUUID()}-${safeBaseName || 'image'}${extension}`;
}

function buildDownloadUrl(bucketName, objectPath, downloadToken) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`;
}

export function createImageUploadMiddleware(multer) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 8,
    },
    fileFilter: (_request, file, callback) => {
      if (!allowedImageMimeTypes.has(file.mimetype)) {
        callback(new Error('Sono consentiti solo file JPG, PNG, WEBP o GIF.'));
        return;
      }

      callback(null, true);
    },
  });
}

export async function uploadImagesToStorage(files) {
  const bucketName = bucket.name;

  if (!bucketName) {
    throw new Error('Firebase Storage non configurato. Imposta FIREBASE_STORAGE_BUCKET.');
  }

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const filename = createSafeFilename(file.originalname);
      const objectPath = `listing-images/${filename}`;
      const downloadToken = randomUUID();
      const bucketFile = bucket.file(objectPath);

      await bucketFile.save(file.buffer, {
        resumable: false,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
            originalName: file.originalname,
          },
        },
      });

      return {
        name: file.originalname,
        url: buildDownloadUrl(bucketName, objectPath, downloadToken),
        path: objectPath,
      };
    })
  );

  return uploadedFiles;
}
