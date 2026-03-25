import { env } from '../../services/env';

type UploadedImage = {
  name: string;
  url: string;
};

type UploadResponse = {
  files: UploadedImage[];
};

type ApiErrorBody = {
  message?: string;
};

export async function uploadListingImages(token: string, files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch(`${env.apiBaseUrl}/uploads/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.message ?? 'Upload immagini non riuscito.');
  }

  const payload = (await response.json()) as UploadResponse;
  return payload.files;
}
