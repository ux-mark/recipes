'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageUploaderProps {
  existingImages: string[];
  recipeName: string;
  onChange: (images: string[]) => void;
}

export function ImageUploader({ existingImages = [], recipeName, onChange }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (!recipeName.trim()) {
      setError('Please enter a recipe name before uploading images');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    // Create FormData
    const formData = new FormData();
    formData.append('recipeName', recipeName);
    formData.append('generateOptimized', 'true');
    
    // Append all files
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('images', e.target.files[i]);
    }
    
    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }
      
      const data = await response.json();
      
      // Update the images array with the new paths
      const updatedImages = [...images, ...data.imagePaths];
      setImages(updatedImages);
      onChange(updatedImages);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // Remove from the server
      const response = await fetch('/api/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imagePaths: [imageToRemove],
          deleteOptimized: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }
      
      // Remove from the state
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onChange(updatedImages);
    } catch (err) {
      console.error('Error removing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove image');
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* File input for uploading */}
      <div className="flex flex-col items-start space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Select Images'}
        </Button>
        
        {uploading && (
          <div className="w-full mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Image gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imagePath, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <div className="aspect-square relative">
                <Image
                  src={`/images/${imagePath}`}
                  alt={`Recipe image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  &times;
                </Button>
              </div>
              
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  Main Image
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}