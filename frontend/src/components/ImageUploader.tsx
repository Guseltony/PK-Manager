import React, { useState, useRef } from 'react';
import { uploadImage, UploadImageResponse } from '../libs/uploadImage';

interface ImageUploaderProps {
  parentType: 'note' | 'dream' | 'task' | 'idea';
  parentId?: string;
  onUploadComplete: (image: UploadImageResponse['image']) => void;
  className?: string;
  iconOnly?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  parentType, 
  parentId, 
  onUploadComplete, 
  className = '',
  iconOnly = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const response = await uploadImage(file, parentType, parentId);
      onUploadComplete(response.image);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Upload failed');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/jpg, image/webp"
      />
      
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={isUploading}
        title="Upload Image"
        className={
          iconOnly 
            ? "h-9 w-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-white/5 hover:text-brand-primary transition-all disabled:opacity-50"
            : "px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-text-main text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed w-fit flex items-center gap-2 shadow-lg"
        }
      >
        {isUploading ? (
          <svg className="animate-spin h-4 w-4 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {!iconOnly && <span>Upload Image</span>}
          </>
        )}
      </button>

      {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{error}</p>}
    </div>
  );
};
