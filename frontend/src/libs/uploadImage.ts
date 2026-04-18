import { BACKEND_URL } from "../constants/constants";
import { Image } from "../types/image";

export interface UploadImageResponse {
  success: boolean;
  image: Image;
}

export const uploadImage = async (
  file: File,
  parentType: 'note' | 'dream' | 'task' | 'idea',
  parentId?: string
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('parentType', parentType);
  if (parentId) {
    formData.append('parentId', parentId);
  }

  const response = await fetch(`${BACKEND_URL}/api/upload/image`, {
    method: 'POST',
    body: formData,
    credentials: 'include', // Needed for auth cookies to pass
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data;
};

export const getImages = async (parentType: 'note' | 'dream' | 'task' | 'idea', parentId: string) => {
  const response = await fetch(`${BACKEND_URL}/api/upload/images/${parentType}/${parentId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch images');
  }

  return data.images;
};

export const deleteImage = async (imageId: string) => {
  const response = await fetch(`${BACKEND_URL}/api/upload/image/${imageId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete image");
  }

  return data.image;
};
