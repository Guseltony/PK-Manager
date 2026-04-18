import { deleteStoredImage, processAndStoreImage } from '../services/imageService.js';

/**
 * Handles image upload requests
 */
export const uploadImageController = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.id;
    const { parentType, parentId } = req.body;

    // Validate request contents before service call
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    if (!parentType) {
      return res.status(400).json({ success: false, message: 'parentType is required' });
    }

    // Call service to handle business logic & persistence
    const savedImage = await processAndStoreImage({
      fileBuffer: file.buffer,
      userId,
      parentType,
      parentId,
    });

    // Return strictly mapped success response
    return res.status(201).json({
      success: true,
      image: {
        id: savedImage.id,
        url: savedImage.url,
        parentType: savedImage.parentType,
        parentId: savedImage.parentId,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Catch specific service validation errors
    const statusCode = error.message === 'Invalid parentType' ? 400 : 500;
    
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

/**
 * Fetch images for a specific parent entity
 */
export const getImagesController = async (req, res) => {
  try {
    const { parentType, parentId } = req.params;
    const userId = req.user.id;
    
    // We import prisma here or from a service, but let's implement inline as requested
    const { prisma } = await import('../libs/prisma.js');

    if (!parentType || !parentId) {
      return res.status(400).json({ success: false, message: 'parentType and parentId are required' });
    }

    const images = await prisma.image.findMany({
      where: {
        userId,
        parentType,
        parentId,
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, images });
  } catch (error) {
    console.error('Fetch images error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch images' });
  }
};

export const deleteImageController = async (req, res) => {
  try {
    const deleted = await deleteStoredImage(req.params.id, req.user.id);
    return res.status(200).json({ success: true, image: deleted });
  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(400).json({ success: false, message: 'Failed to delete image', error: error.message });
  }
};
