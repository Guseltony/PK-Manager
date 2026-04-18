"use client";

import Modal from "./ui/Modal";

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({
  isOpen,
  imageUrl,
  alt = "Preview image",
  onClose,
}: ImageLightboxProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Image Preview"
      panelClassName="max-w-6xl"
    >
      {imageUrl ? (
        <div className="flex items-center justify-center">
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
      ) : null}
    </Modal>
  );
}
