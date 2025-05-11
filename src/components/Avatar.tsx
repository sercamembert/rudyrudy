// components/Avatar.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface AvatarUploadProps {
  userId: string;
  initialImageUrl?: string;
  onImageUpload: (url: string) => void;
}

export function AvatarUpload({
  userId,
  initialImageUrl,
  onImageUpload,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}-profile.${fileExt}`;

    setUploading(true);
    setError("");

    try {
      // Przesyłanie do Supabase storage
      const { data, error } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      // Pobierz publiczny URL
      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      console.log(urlData.publicUrl);

      setImageUrl(urlData.publicUrl);
      onImageUpload(urlData.publicUrl);
    } catch (err) {
      setError("Wystąpił błąd podczas przesyłania obrazu");
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Zdjęcie profilowe"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            className="relative"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            {uploading ? "Przesyłanie..." : "Zmień zdjęcie"}
          </Button>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
