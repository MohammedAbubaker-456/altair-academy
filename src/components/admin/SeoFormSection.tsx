/**
 * Admin Reusable SEO Form Section
 *
 * Provides an optional, collapsible section for editing record-level SEO overrides
 * (metaTitle, metaDescription, and optional ogImage) with real-time Google search snippet
 * and social card previews.
 *
 * Location: src/components/admin/SeoFormSection.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Globe, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";

interface SeoFormSectionProps {
  metaTitle: string | null | undefined;
  metaDescription: string | null | undefined;
  ogImage?: string | null | undefined;
  showOgImage?: boolean;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onOgImageChange?: (val: string | null) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackSlug?: string;
  fallbackImage?: string | null;
  basePath?: string;
}

export function SeoFormSection({
  metaTitle,
  metaDescription,
  ogImage,
  showOgImage = false,
  onTitleChange,
  onDescriptionChange,
  onOgImageChange,
  fallbackTitle,
  fallbackDescription,
  fallbackSlug = "",
  fallbackImage = null,
  basePath = "/",
}: SeoFormSectionProps) {
  const isCustomized = Boolean(
    (metaTitle && metaTitle.trim().length > 0) ||
      (metaDescription && metaDescription.trim().length > 0) ||
      (ogImage && ogImage.trim().length > 0),
  );

  const [isOpen, setIsOpen] = React.useState(isCustomized);

  const titleLength = metaTitle?.length || 0;
  const descLength = metaDescription?.length || 0;

  const isTitleIdeal = titleLength >= 30 && titleLength <= 60;
  const isDescIdeal = descLength >= 70 && descLength <= 160;

  const effectiveTitle = metaTitle?.trim() || fallbackTitle || "Page Title — Altair Academy";
  const effectiveDescription =
    metaDescription?.trim() ||
    fallbackDescription ||
    "Page description snippet will appear here on search results and social cards.";

  const effectiveImage = ogImage || fallbackImage || "/seed/courses/ndt-level2.webp";
  const cleanPath = `${basePath.endsWith("/") ? basePath : `${basePath}/`}${fallbackSlug}`.replace(
    /\/+/g,
    "/",
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10 text-navy shrink-0">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-foreground">
                SEO &amp; Search Previews
              </span>
              <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              {isCustomized ? (
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 text-[11px] py-0">
                  Customised
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[11px] py-0">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize page title, meta description, and social share card overrides for this record.
            </p>
          </div>
        </div>
        <div className="text-muted-foreground p-1">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 border-t border-border">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Controls */}
            <div className="space-y-5">
              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo-meta-title" className="text-sm font-medium">
                    Meta Title Override
                  </Label>
                  <span
                    className={cn(
                      "text-xs tabular-nums font-medium",
                      titleLength > 120
                        ? "text-destructive"
                        : isTitleIdeal
                          ? "text-emerald-600 font-semibold"
                          : "text-muted-foreground",
                    )}
                  >
                    {titleLength} / 120 chars
                    {isTitleIdeal && " (optimal)"}
                  </span>
                </div>
                <Input
                  id="seo-meta-title"
                  value={metaTitle ?? ""}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder={`Default: ${fallbackTitle || "Title — Altair Academy"}`}
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 30–60 characters. Leave blank to use the default title format.
                </p>
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo-meta-desc" className="text-sm font-medium">
                    Meta Description Override
                  </Label>
                  <span
                    className={cn(
                      "text-xs tabular-nums font-medium",
                      descLength > 300
                        ? "text-destructive"
                        : isDescIdeal
                          ? "text-emerald-600 font-semibold"
                          : "text-muted-foreground",
                    )}
                  >
                    {descLength} / 300 chars
                    {isDescIdeal && " (optimal)"}
                  </span>
                </div>
                <Textarea
                  id="seo-meta-desc"
                  rows={3}
                  value={metaDescription ?? ""}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder={`Default: ${fallbackDescription || "Summary snippet..."}`}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 70–160 characters. Summarize the content concisely for search engines.
                </p>
              </div>

              {/* Social Image (if enabled) */}
              {showOgImage && onOgImageChange && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Custom Social Share Image</Label>
                  <ImageUpload
                    value={ogImage}
                    onChange={onOgImageChange}
                    folder="seo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended dimensions: 1200 x 630 px. Overrides the item&apos;s main picture on Facebook, X, and LinkedIn.
                  </p>
                </div>
              )}
            </div>

            {/* Live Dual Previews */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Live Search &amp; Social Previews
              </div>

              {/* Google Search Result Preview */}
              <div className="rounded-lg border border-border bg-background p-4 shadow-2xs space-y-1.5">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Google Search Snippet
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold">
                    A
                  </div>
                  <div className="text-xs leading-tight text-foreground">
                    <span className="font-medium">Altair Academy</span>
                    <span className="text-muted-foreground block text-[11px] truncate max-w-[280px]">
                      https://altairacademy.com{cleanPath}
                    </span>
                  </div>
                </div>
                <h4 className="text-base text-blue-700 hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
                  {effectiveTitle}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {effectiveDescription}
                </p>
              </div>

              {/* Social Card Preview */}
              <div className="rounded-lg border border-border bg-background overflow-hidden shadow-2xs">
                <div className="p-3 pb-2 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Social Share Card Preview
                </div>
                <div className="relative aspect-[1.91/1] w-full bg-muted border-y border-border">
                  {effectiveImage ? (
                    <Image
                      src={effectiveImage}
                      alt={effectiveTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No Image Provided
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                    ALTAIRACADEMY.COM
                  </span>
                  <div className="text-xs font-bold text-foreground line-clamp-1">
                    {effectiveTitle}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                    {effectiveDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
