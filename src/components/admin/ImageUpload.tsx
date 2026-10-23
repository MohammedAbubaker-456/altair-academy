/**
 * Admin Image Upload Component
 *
 * Provides an interactive UI for uploading images directly to Cloudinary storage,
 * previewing current images, replacing or removing images, and a fallback for
 * directly pasting image URLs.
 *
 * Location: src/components/admin/ImageUpload.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImageAction } from "@/app/admin/upload-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Link as LinkIcon, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  folder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = "";

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImageAction(formData, folder);
      if (result.ok) {
        onChange(result.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlInput("");
      setShowUrlInput(false);
      toast.success("Image URL applied");
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block overflow-hidden rounded-lg border bg-muted/20">
          <div className="relative h-44 w-72 max-w-full">
            <Image src={value} alt="Uploaded preview" fill className="object-cover" unoptimized />
          </div>
          <div className="flex items-center gap-2 border-t bg-card p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={disabled || isUploading}
              onClick={() => onChange(null)}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">No image selected</p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or WEBP up to 5MB</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              {showUrlInput ? "Hide URL input" : "Paste image URL"}
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Direct URL input fallback */}
      {showUrlInput && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
          <Input
            type="url"
            placeholder="https://... or /seed/course-ndt.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={disabled || isUploading}
            className="h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            className="h-8"
            disabled={disabled || isUploading || !urlInput.trim()}
            onClick={handleApplyUrl}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
