import cloudinary from '../config/cloudinary.js';
import { prisma } from '../libs/prisma.js';

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} buffer - The image buffer to upload
 * @param {string} folder - The destination folder on Cloudinary
 * @returns {Promise<Object>} The Cloudinary upload response
 */
export const uploadImageToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Write the buffer to the upload stream
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID
 * @param {string} publicId - The public ID of the resource
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Processes an uploaded image buffer, uploads it to Cloudinary, and stores metadata in PostgreSQL via Prisma.
 * @param {Object} params - The upload parameters
 * @returns {Promise<Object>} The saved database Image record
 */
export const processAndStoreImage = async ({ fileBuffer, userId, parentType, parentId }) => {
  // 1. Validate parentType
  const allowedTypes = ['note', 'dream', 'task', 'idea'];
  if (!allowedTypes.includes(parentType)) {
    throw new Error('Invalid parentType');
  }

  // 2. Folder Logic based on parentType
  const folder = `pkm/${parentType}s`; // e.g. pkm/notes, pkm/dreams

  // 3. Upload to Cloudinary
  const cloudinaryResult = await uploadImageToCloudinary(fileBuffer, folder);

  // 4. Save metadata in Prisma
  const savedImage = await prisma.image.create({
    data: {
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      size: cloudinaryResult.bytes,
      format: cloudinaryResult.format,
      userId: userId,
      parentType: parentType,
      parentId: parentId || null,
      aiProcessed: false, // For future AI readiness
    },
  });

  return savedImage;
};

export const deleteStoredImage = async (imageId, userId) => {
  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  if (image.publicId) {
    await deleteImageFromCloudinary(image.publicId);
  }

  await prisma.image.delete({
    where: { id: imageId },
  });

  return image;
};
