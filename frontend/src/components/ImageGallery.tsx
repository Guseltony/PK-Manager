"use client";

import { useState, useEffect } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";
import { ImageUploader } from "./ImageUploader";
import { deleteImage, getImages } from "../libs/uploadImage";
import { Image } from "../types/image";
import { ImageLightbox } from "./ImageLightbox";

export function ImageGallery({ parentType, parentId }: { parentType: "dream" | "task" | "idea" | "note", parentId: string }) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, [parentId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getImages(parentType, parentId);
      setImages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (image: Image) => {
    setImages((prev) => [image, ...prev]);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      setDeletingId(imageId);
      await deleteImage(imageId);
      setImages((prev) => prev.filter((image) => image.id !== imageId));
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-text-muted text-sm italic py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10 p-4">Loading visual data...</div>;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
          <FiImage /> Visual References
        </h3>
        <ImageUploader parentType={parentType} parentId={parentId} onUploadComplete={handleUploadComplete} />
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-3xl overflow-hidden border border-white/5 bg-white/5 aspect-video flex-shrink-0 hover:border-brand-primary/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <button
                type="button"
                onClick={() => setActiveImage(img.url)}
                className="h-full w-full"
              >
                <img src={img.url} alt="Gallery item" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                disabled={deletingId === img.id}
                className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/60 p-2 text-white transition hover:bg-red-500/80 disabled:opacity-50"
                title="Delete image"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10 w-full">
          <p className="text-text-muted text-sm italic">
            No visual assets connected to this node. Add images above to build a moodboard.
          </p>
        </div>
      )}

      <ImageLightbox
        isOpen={Boolean(activeImage)}
        imageUrl={activeImage}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}
