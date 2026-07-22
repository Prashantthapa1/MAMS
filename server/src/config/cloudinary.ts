import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';
import { env } from './env.js';
import { ApiError } from '../utils/apiError.js';

let isConfigured = false;

function ensureConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new ApiError(
      500,
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    );
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    isConfigured = true;
  }
}

function createBufferStream(buffer: Buffer) {
  return Readable.from([buffer]);
}

export async function uploadEmployeeImage(file: Express.Multer.File) {
  ensureConfigured();

  return new Promise<{ secureUrl: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'employee-management/employees',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    createBufferStream(file.buffer).pipe(stream);
  });
}

export async function deleteEmployeeImage(publicId?: string | null) {
  if (!publicId) {
    return;
  }

  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
