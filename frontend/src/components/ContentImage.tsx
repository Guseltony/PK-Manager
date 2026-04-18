"use client";

interface ContentImageProps {
  src?: string;
  alt?: string;
  title?: string;
  className?: string;
  onOpen?: (src: string, alt?: string) => void;
}

export function ContentImage({
  src,
  alt,
  title,
  className = "",
  onOpen,
}: ContentImageProps) {
  if (!src) return null;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(src, alt)}
      className="block w-full cursor-zoom-in"
      title={title || alt || "Open image"}
    >
      <img
        src={src}
        alt={alt || "Embedded content image"}
        className={`h-auto max-h-40 w-auto max-w-full rounded-2xl object-contain ${className}`}
      />
    </button>
  );
}
