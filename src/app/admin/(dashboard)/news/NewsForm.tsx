/**
 * News Post Create / Edit Form Component
 *
 * Full-featured interactive form for publishing news posts with dynamic fields
 * depending on article kind (Featured, Story, Pick), date selection, and server disk media upload.
 *
 * Location: src/app/admin/(dashboard)/news/NewsForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { newsPostSchema, type NewsPostInput } from "@/lib/validation/news";
import { slugify } from "@/lib/slugify";
import { createNewsPostAction, updateNewsPostAction } from "@/app/admin/news/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/components/site/MarkdownContent";
import { Loader2, ArrowLeft, X, Plus, ExternalLink, AlertTriangle } from "lucide-react";
import type { NewsKind } from "@prisma/client";

interface NewsPostInitialData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: string | null;
  kind: NewsKind;
  category: string | null;
  tags: string[];
  image: string | null;
  publishedAt: Date;
  status: "ACTIVE" | "INACTIVE";
}

interface NewsFormProps {
  initialData?: NewsPostInitialData | null;
}

export function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tagInput, setTagInput] = React.useState("");

  // Format initial publishedAt to YYYY-MM-DD
  const defaultDateStr = initialData
    ? new Date(initialData.publishedAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsPostInput>({
    resolver: zodResolver(newsPostSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      body: initialData?.body ?? "",
      kind: initialData?.kind ?? "STORY",
      category: initialData?.category ?? null,
      tags: initialData?.tags ?? [],
      image: initialData?.image ?? null,
      publishedAt: new Date(defaultDateStr || Date.now()),
      status: initialData?.status ?? "ACTIVE",
    },
  });

  const selectedKind = watch("kind");
  const currentTags = watch("tags") || [];
  const currentSlug = watch("slug") || "";
  const currentStatus = watch("status");
  const currentBody = watch("body") || "";

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value, { shouldValidate: true });
    if (!initialData) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !currentTags.includes(trimmed)) {
      setValue("tags", [...currentTags, trimmed], { shouldValidate: true });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: NewsPostInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateNewsPostAction(initialData.id, data);
        handleAdminActionResult(result, () => {
          router.push("/admin/news");
          router.refresh();
        });
      } else {
        const result = await createNewsPostAction(data);
        handleAdminActionResult(result, () => {
          router.push("/admin/news");
          router.refresh();
        });
      }
    } catch (err) {
      console.error("[NewsForm] Submit error:", err);
      toast.error("An unexpected error occurred. Please refresh the page.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/news">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            {initialData ? `Edit Post: ${initialData.title}` : "Add News Post"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update article copy, tags, or publishing schedule."
              : "Create an industry article, hero feature, or editor pick."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Article Details</CardTitle>
            <CardDescription>Title, format type, and excerpt preview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="news-title">Headline</Label>
              <Input
                id="news-title"
                placeholder="e.g. Next-Generation Phased Array Ultrasonic Testing Standards"
                {...register("title")}
                onChange={handleTitleChange}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="news-slug">URL Slug</Label>
                  {currentSlug && currentStatus === "ACTIVE" && (
                    <Link
                      href={`/news/${currentSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-red hover:underline"
                    >
                      <span>View live</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <Input
                  id="news-slug"
                  placeholder="e.g. next-generation-phased-array"
                  {...register("slug")}
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                {initialData && currentSlug !== initialData.slug && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/50">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      Changing the slug of a published post will break existing bookmarks or links
                      pointing to /news/{initialData.slug}.
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Public URL:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                    /news/{currentSlug || "slug"}
                  </code>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="news-kind">Article Kind / Section</Label>
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="news-kind">
                        <SelectValue placeholder="Select article type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FEATURED">FEATURED (Hero banner item)</SelectItem>
                        <SelectItem value="STORY">STORY (Latest 6 stories grid)</SelectItem>
                        <SelectItem value="PICK">PICK (Editor's pick column)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Conditional Field: Category for FEATURED */}
            {selectedKind === "FEATURED" && (
              <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3">
                <Label htmlFor="news-category">Hero Category Label</Label>
                <Input
                  id="news-category"
                  placeholder="e.g. Technical Insights"
                  defaultValue={initialData?.category ?? ""}
                  onChange={(e) =>
                    setValue("category", e.target.value.trim() ? e.target.value : null, {
                      shouldValidate: true,
                    })
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Displayed as the category pill above the hero featured headline.
                </p>
              </div>
            )}

            {/* Conditional Field: Tags for STORY */}
            {selectedKind === "STORY" && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <Label>Story Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Technology (Press Enter to add)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {currentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 bg-navy/10 text-navy font-normal"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="news-excerpt">Summary Excerpt</Label>
              <Textarea
                id="news-excerpt"
                rows={3}
                placeholder="Brief summary or introductory lead..."
                {...register("excerpt")}
              />
              {errors.excerpt && (
                <p className="text-xs text-destructive">{errors.excerpt.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Article Body (Markdown) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-display">Body (Markdown)</CardTitle>
              <CardDescription>
                Full article content rendered with safe Markdown formatting on the detail page.
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {currentBody.length.toLocaleString()} / 50,000
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[240px]">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="space-y-3 pt-2">
                <Textarea
                  id="news-body"
                  rows={14}
                  placeholder="Write article content in Markdown here...&#10;&#10;## Section Heading&#10;&#10;Detailed explanation and technical findings..."
                  className="font-mono text-sm leading-relaxed"
                  {...register("body")}
                />
                {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}

                <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5">
                  <p className="font-semibold text-foreground">Markdown Cheat Sheet:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
                    <div>
                      <code>## Heading 2</code>, <code>### Heading 3</code>
                    </div>
                    <div>
                      <code>**Bold text**</code>, <code>*Italic text*</code>
                    </div>
                    <div>
                      <code>- Bullet list item</code>
                    </div>
                    <div>
                      <code>1. Numbered list item</code>
                    </div>
                    <div>
                      <code>[Link text](https://example.com)</code>
                    </div>
                    <div>
                      <code>&gt; Blockquote text</code>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 italic pt-1">
                    Note: Raw HTML and images are sanitized for security. Links open safely in new
                    tabs.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="pt-2">
                <MarkdownPreview
                  content={currentBody}
                  placeholder="No article body written yet. Switch to the Write tab to draft Markdown."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Featured Image</CardTitle>
            <CardDescription>Article visual banner.</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUpload value={field.value} onChange={field.onChange} folder="news" />
              )}
            />
          </CardContent>
        </Card>

        {/* Publishing Date & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Schedule & Publication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="news-date">Publication Date</Label>
                <Input
                  id="news-date"
                  type="date"
                  defaultValue={defaultDateStr}
                  onChange={(e) => {
                    const parsed = new Date(e.target.value);
                    if (!isNaN(parsed.getTime())) {
                      setValue("publishedAt", parsed, { shouldValidate: true });
                    }
                  }}
                />
                {errors.publishedAt && (
                  <p className="text-xs text-destructive">{errors.publishedAt.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="news-status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="news-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE (Published publicly)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Hidden from public)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link href="/admin/news">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="bg-navy hover:bg-navy/90 text-primary-foreground font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              "Update Post"
            ) : (
              "Publish Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
