/**
 * Legal Page Create / Edit Form Component
 *
 * Full-featured interactive form for managing legal documents.
 * Includes slug generator with core page locking, Write/Preview tabs with MarkdownPreview,
 * dynamic placeholder token guidance, and metadata optimization.
 *
 * Location: src/app/admin/(dashboard)/legal/LegalForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { legalPageSchema, type LegalPageInput } from "@/lib/validation/legal";
import { slugify } from "@/lib/slugify";
import { legalHref } from "@/lib/legal";
import { createLegalPageAction, updateLegalPageAction } from "@/app/admin/legal/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Loader2,
  ArrowLeft,
  Lock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";

export interface LegalPageInitialData {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  body: string;
  showInFooter: boolean;
  isCore: boolean;
  order: number;
  status: "ACTIVE" | "INACTIVE";
}

interface LegalFormProps {
  initialData?: LegalPageInitialData | null;
}

export function LegalForm({ initialData }: LegalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isCore = initialData?.isCore ?? false;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<LegalPageInput>({
    resolver: zodResolver(legalPageSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      metaDescription: initialData?.metaDescription ?? "",
      body: initialData?.body ?? "",
      showInFooter: initialData?.showInFooter ?? true,
      order: initialData?.order ?? 0,
      status: initialData?.status ?? "ACTIVE",
    },
  });

  const currentSlug = watch("slug") || "";
  const currentStatus = watch("status");
  const currentBody = watch("body") || "";
  const currentMetaDesc = watch("metaDescription") || "";

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value, { shouldValidate: true });
    if (!initialData && !isCore) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: LegalPageInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateLegalPageAction(initialData.id, data);
        if (result.ok) {
          toast.success(result.message);
          router.push("/admin/legal");
          router.refresh();
        } else {
          if (result.authError) {
            toast.error(result.message || "Session expired, please sign in again");
            window.location.href = "/admin/login";
            return;
          }
          toast.error(result.message);
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              if (messages?.[0]) {
                setError(field as keyof LegalPageInput, { message: messages[0] });
              }
            });
          }
        }
      } else {
        const result = await createLegalPageAction(data);
        if (result.ok) {
          toast.success(result.message);
          router.push("/admin/legal");
          router.refresh();
        } else {
          if (result.authError) {
            toast.error(result.message || "Session expired, please sign in again");
            window.location.href = "/admin/login";
            return;
          }
          toast.error(result.message);
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              if (messages?.[0]) {
                setError(field as keyof LegalPageInput, { message: messages[0] });
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("[LegalForm] Submit error:", err);
      toast.error("An unexpected error occurred. Please refresh the page.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const publicUrl = currentSlug ? legalHref(currentSlug) : "";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/legal">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
              {initialData ? `Edit: ${initialData.title}` : "Add Legal Document"}
            </h1>
            {isCore && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Core System Page
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update document body, metadata, or footer visibility."
              : "Draft and publish a new policy or compliance page."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Document Basics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Document Details</CardTitle>
            <CardDescription>Document title and URL routing identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="legal-title">Document Title</Label>
              <Input
                id="legal-title"
                placeholder="e.g. Privacy Policy, Cookie Policy"
                {...register("title")}
                onChange={handleTitleChange}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="legal-slug">URL Slug</Label>
                  {isCore && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                {publicUrl && currentStatus === "ACTIVE" && (
                  <Link
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-red hover:underline"
                  >
                    <span>View live page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <Input
                id="legal-slug"
                placeholder="e.g. cookie-policy"
                disabled={isCore}
                {...register("slug")}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              {isCore ? (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Slug is locked for core system pages to preserve canonical routing.
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Public URL:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                    {publicUrl || "/legal/..."}
                  </code>
                </p>
              )}
              {initialData && !isCore && currentSlug !== initialData.slug && (
                <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/50">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    Changing this slug will break existing bookmarks or links pointing to /legal/
                    {initialData.slug}.
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="legal-meta">SEO Meta Description</Label>
                <span className="text-xs text-muted-foreground font-mono">
                  {currentMetaDesc.length} / 200
                </span>
              </div>
              <Textarea
                id="legal-meta"
                rows={2}
                placeholder="Brief summary for search engine results and social previews..."
                {...register("metaDescription")}
              />
              {errors.metaDescription && (
                <p className="text-xs text-destructive">{errors.metaDescription.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Markdown Body Editor */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-display">Document Body (Markdown)</CardTitle>
              <CardDescription>Full policy content formatted in safe Markdown.</CardDescription>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {currentBody.length.toLocaleString()} / 50,000
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dynamic Placeholder Tokens Help Banner */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 p-3 text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Dynamic Placeholder Tokens (Auto-Updated from Database)</span>
              </div>
              <p className="leading-relaxed">
                You can insert placeholder tokens into policy text. When rendered on the public
                website, they are automatically replaced with the active contact details:
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                <code className="bg-background border px-1.5 py-0.5 rounded text-foreground">
                  {"{{email}}"}
                </code>
                <span className="text-muted-foreground self-center">→ Active primary email</span>
                <code className="bg-background border px-1.5 py-0.5 rounded text-foreground">
                  {"{{phone}}"}
                </code>
                <span className="text-muted-foreground self-center">→ Active primary phone</span>
                <code className="bg-background border px-1.5 py-0.5 rounded text-foreground">
                  {"{{address}}"}
                </code>
                <span className="text-muted-foreground self-center">→ Active office address</span>
              </div>
            </div>

            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[240px]">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="space-y-3 pt-2">
                <Textarea
                  id="legal-body"
                  rows={16}
                  placeholder="## 1. Information We Collect&#10;&#10;We may collect personal data when you interact with our services...&#10;&#10;Contact us at {{email}} or call {{phone}}."
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
                      <code>[Link](https://example.com)</code>
                    </div>
                    <div>
                      <code>&gt; Blockquote note</code>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 italic pt-1">
                    Note: Raw HTML and images are sanitized for security. External links open safely
                    in a new tab.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="pt-2">
                <MarkdownPreview
                  content={currentBody}
                  placeholder="No content entered yet. Switch to the Write tab to draft Markdown."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Placement & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Navigation &amp; Publication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="legal-order">Footer Order</Label>
                <Input
                  id="legal-order"
                  type="number"
                  min={0}
                  max={9999}
                  {...register("order", { valueAsNumber: true })}
                />
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="legal-status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="legal-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE (Published publicly)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Hidden / 404)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {isCore && currentStatus === "INACTIVE" && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Important Notice:</strong> Setting a core page to INACTIVE will cause{" "}
                  <code>{publicUrl}</code> to return 404 Not Found to visitors and will remove the
                  link from the footer.
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Controller
                name="showInFooter"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="legal-footer"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                )}
              />
              <Label htmlFor="legal-footer" className="text-sm font-normal cursor-pointer">
                Display link to this document in the website footer legal links
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link href="/admin/legal">Cancel</Link>
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
              "Update Document"
            ) : (
              "Publish Document"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
