'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  images: { id: string; preview: string; url?: string }[];
  maxImages?: number;
  isUploading?: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
}

export default function PhotoUploader({
  images,
  maxImages = 9,
  isUploading = false,
  onSelect,
  onRemove,
}: PhotoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <ImageIcon size={14} className="mr-1.5 text-gray-500" />
        Photos ({images.length}/{maxImages}) &mdash; helps narrow your quote
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
              <Image src={img.preview} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors z-10"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-lg p-3.5 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>{images.length === 0 ? 'Upload Photos' : `Add More (${maxImages - images.length} remaining)`}</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
