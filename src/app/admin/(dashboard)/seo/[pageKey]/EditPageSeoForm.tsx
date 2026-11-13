/**
 * Admin Edit Page SEO Form Component
 *
 * Full-featured interactive form for configuring individual page SEO overrides,
 * detail template placeholders, search indexing rules, and dual live previews.
 *
 * Location: src/app/admin/(dashboard)/seo/[pageKey]/EditPageSeoForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PageSeo } from "@prisma/client";
import type { SeoRegistryItem } from "@/lib/seo/registry";
import { savePageSeo, resetPageSeo } from "@/app/admin/seo/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Tag,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditPageSeoFormProps {
  registryItem: SeoRegistryItem;
  initialPageSeo: PageSeo | null;
}

const SAMPLE_TEMPLATE_PATHS: Record<string, string> = {
  "course-detail": "/courses/ultrasonic-testing-level-2",
  "news-detail": "/news/welding-inspection-certifications",
  "team-detail": "/team/shaik-khaja-mohiuddin",
  "legal-detail": "/privacy",
};

const SAMPLE_TEMPLATE_REPLACEMENTS: Record<string, Record<string, string>> = {
  "course-detail": {
    "{title}": "Ultrasonic Testing Level 2 (UT2)",
    "{category}": "Non-Destructive Testing",
    "{level}": "Level 2 Certification",
    "{summary}":
      "Comprehensive 80-hour practitioner certification course covering manual ultrasonic examination techniques.",
  },
  "news-detail": {
    "{title}": "Welding Inspection Certification Changes for 2026",
    "{excerpt}":
      "Key revisions to inspection syllabus, practical assessment standards, and renewal schedules.",
    "{category}": "Industry Insights",
  },
  "team-detail": {
    "{name}": "Shaik Khaja Mohiuddin",
    "{role}": "Managing Director & Senior Level III",
    "{bio}":
      "Practising Level III specialist with over 25 years of global field testing experience.",
  },
  "legal-detail": {
    "{title}": "Cookie & Compliance Policy",
  },
};

export function EditPageSeoForm({ registryItem, initialPageSeo }: EditPageSeoFormProps) {
  const router = useRouter();

  // Field states
  const [title, setTitle] = React.useState(initialPageSeo?.title ?? "");
  const [description, setDescription] = React.useState(initialPageSeo?.description ?? "");
  const [ogTitle, setOgTitle] = React.useState(initialPageSeo?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = React.useState(initialPageSeo?.ogDescription ?? "");
  const [ogImage, setOgImage] = React.useState<string | null>(initialPageSeo?.ogImage ?? null);
  const [canonicalPath, setCanonicalPath] = React.useState(initialPageSeo?.canonicalPath ?? "");

  // Indexing state: "DEFAULT", "INDEX", "NOINDEX"
  const initialIndexing =
    initialPageSeo?.noIndex === true
      ? "NOINDEX"
      : initialPageSeo?.noIndex === false
        ? "INDEX"
        : "DEFAULT";
  const [indexing, setIndexing] = React.useState<string>(initialIndexing);

  // Active focused input for placeholder insertion
  const [activeField, setActiveField] = React.useState<"title" | "desc" | "ogTitle" | "ogDesc">(
    "title",
  );

  // Actions and dialog state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const isCustomized = Boolean(
    initialPageSeo &&
    (initialPageSeo.title ||
      initialPageSeo.description ||
      initialPageSeo.ogTitle ||
      initialPageSeo.ogDescription ||
      initialPageSeo.ogImage ||
      initialPageSeo.canonicalPath ||
      initialPageSeo.noIndex !== null),
  );

  // Character counts
  const titleLen = title.length;
  const descLen = description.length;
  const isTitleIdeal = titleLen >= 30 && titleLen <= 60;
  const isDescIdeal = descLen >= 70 && descLen <= 160;

  // Insert token helper
  const handleInsertPlaceholder = (token: string) => {
    switch (activeField) {
      case "title":
        setTitle((prev) => (prev ? `${prev} ${token}` : token));
        break;
      case "desc":
        setDescription((prev) => (prev ? `${prev} ${token}` : token));
        break;
      case "ogTitle":
        setOgTitle((prev) => (prev ? `${prev} ${token}` : token));
        break;
      case "ogDesc":
        setOgDescription((prev) => (prev ? `${prev} ${token}` : token));
        break;
    }
  };

  // Replace sample template tokens for preview
  const replaceTokens = (text: string) => {
    if (!registryItem.isTemplate) return text;
    let res = text;
    const samples = SAMPLE_TEMPLATE_REPLACEMENTS[registryItem.key] || {};
    for (const [k, v] of Object.entries(samples)) {
      res = res.replaceAll(k, v);
    }
    return res;
  };

  // Preview derivations
  const previewRawTitle = title.trim() || registryItem.defaults.title;
  const previewTitle = replaceTokens(previewRawTitle);

  const previewRawDesc = description.trim() || registryItem.defaults.description;
  const previewDesc = replaceTokens(previewRawDesc);

  const previewOgTitle = replaceTokens(
    ogTitle.trim() || title.trim() || registryItem.defaults.ogTitle,
  );
  const previewOgDesc = replaceTokens(
    ogDescription.trim() || description.trim() || registryItem.defaults.ogDescription,
  );

  const previewImage = ogImage || registryItem.defaults.ogImage || "/seed/courses/ndt-level2.webp";

  const effectivePath =
    canonicalPath.trim() || SAMPLE_TEMPLATE_PATHS[registryItem.key] || registryItem.path;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let noIndexVal: boolean | null = null;
    if (indexing === "NOINDEX") noIndexVal = true;
    if (indexing === "INDEX") noIndexVal = false;

    try {
      const res = await savePageSeo(registryItem.key, {
        title: title || null,
        description: description || null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        canonicalPath: canonicalPath || null,
        noIndex: noIndexVal,
      });

      if (res.ok) {
        toast.success(res.message);
        router.push("/admin/seo");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to save page SEO settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to default Handler
  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await resetPageSeo(registryItem.key);
      if (res.ok) {
        toast.success(res.message);
        router.push("/admin/seo");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to reset page SEO");
    } finally {
      setIsResetting(false);
      setIsResetDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link href="/admin" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/seo" className="hover:text-foreground">
            SEO &amp; Meta Tags
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{registryItem.label}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/seo">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
                  Edit SEO — {registryItem.label}
                </h1>
                {isCustomized ? (
                  <Badge
                    variant="outline"
                    className="text-emerald-700 bg-emerald-50 border-emerald-300 text-xs py-0.5"
                  >
                    Customised
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-xs py-0.5">
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Path:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                  {registryItem.path}
                </code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link
                href={SAMPLE_TEMPLATE_PATHS[registryItem.key] || registryItem.path}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View Public Page</span>
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Template Placeholder Chips (if applicable) */}
      {registryItem.isTemplate && registryItem.allowedPlaceholders && (
        <Card className="border-border bg-muted/20 shadow-2xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Tag className="h-3.5 w-3.5 text-navy" />
              <span>Available Dynamic Placeholders for this Template</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click a placeholder chip to insert it into the active text field. These tokens will be
              dynamically replaced by each record&apos;s data when the page renders.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {registryItem.allowedPlaceholders.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => handleInsertPlaceholder(token)}
                  className="inline-flex items-center gap-1 text-xs font-mono font-medium bg-background hover:bg-navy/10 hover:text-navy border border-border px-2.5 py-1 rounded-md transition-colors"
                >
                  <code>{token}</code>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Two-Column Layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Form Fields (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">
                  Page Metadata &amp; Search Tags
                </CardTitle>
                <CardDescription className="text-xs">
                  Leave any field blank to preserve its default value.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="page-title" className="text-sm font-medium">
                      Meta Title
                    </Label>
                    <span
                      className={cn(
                        "text-xs tabular-nums font-medium",
                        titleLen > 120
                          ? "text-destructive font-semibold"
                          : isTitleIdeal
                            ? "text-emerald-600 font-semibold"
                            : "text-muted-foreground",
                      )}
                    >
                      {titleLen} / 120 chars {isTitleIdeal && "(optimal: 30-60)"}
                    </span>
                  </div>
                  <Input
                    id="page-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setActiveField("title")}
                    placeholder={`Default: ${registryItem.defaults.title}`}
                    maxLength={120}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Default: <span className="italic">{registryItem.defaults.title}</span>
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="page-desc" className="text-sm font-medium">
                      Meta Description
                    </Label>
                    <span
                      className={cn(
                        "text-xs tabular-nums font-medium",
                        descLen > 300
                          ? "text-destructive font-semibold"
                          : isDescIdeal
                            ? "text-emerald-600 font-semibold"
                            : "text-muted-foreground",
                      )}
                    >
                      {descLen} / 300 chars {isDescIdeal && "(optimal: 70-160)"}
                    </span>
                  </div>
                  <Textarea
                    id="page-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setActiveField("desc")}
                    placeholder={`Default: ${registryItem.defaults.description}`}
                    maxLength={300}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Default: <span className="italic">{registryItem.defaults.description}</span>
                  </p>
                </div>

                {/* Canonical Path */}
                <div className="space-y-1.5">
                  <Label htmlFor="page-canonical" className="text-sm font-medium">
                    Canonical Path Override
                  </Label>
                  <Input
                    id="page-canonical"
                    value={canonicalPath}
                    onChange={(e) => setCanonicalPath(e.target.value)}
                    placeholder={`Default: ${registryItem.path}`}
                    maxLength={200}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Must start with a single &apos;/&apos; (e.g. <code>{registryItem.path}</code>).
                    Leave blank to use standard route path.
                  </p>
                </div>

                {/* Indexing Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="page-indexing" className="text-sm font-medium">
                    Search Engine Indexing
                  </Label>
                  <Select value={indexing} onValueChange={setIndexing}>
                    <SelectTrigger id="page-indexing">
                      <SelectValue placeholder="Select indexing rule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEFAULT">
                        Use Default ({registryItem.defaults.noIndex ? "Noindex" : "Index"})
                      </SelectItem>
                      <SelectItem value="INDEX">Index (Allow search engines to index)</SelectItem>
                      <SelectItem value="NOINDEX">Noindex (Hide from search engines)</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Warning if noindex selected on indexable page */}
                  {indexing === "NOINDEX" && !registryItem.defaults.noIndex && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 mt-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <strong>Notice:</strong> Setting this page to Noindex will instruct Google,
                        Bing, and other search engines to drop this page from their public search
                        results.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Open Graph & Social Share Card Overrides */}
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">
                  Social Share Overrides (Open Graph)
                </CardTitle>
                <CardDescription className="text-xs">
                  Specific titles and pictures for Facebook, X, LinkedIn, and messaging apps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* OG Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="og-title" className="text-sm font-medium">
                      Open Graph Title
                    </Label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {ogTitle.length} / 120 chars
                    </span>
                  </div>
                  <Input
                    id="og-title"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    onFocus={() => setActiveField("ogTitle")}
                    placeholder={`Default: ${registryItem.defaults.ogTitle}`}
                    maxLength={120}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to inherit the Meta Title above.
                  </p>
                </div>

                {/* OG Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="og-desc" className="text-sm font-medium">
                      Open Graph Description
                    </Label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {ogDescription.length} / 300 chars
                    </span>
                  </div>
                  <Textarea
                    id="og-desc"
                    rows={2}
                    value={ogDescription}
                    onChange={(e) => setOgDescription(e.target.value)}
                    onFocus={() => setActiveField("ogDesc")}
                    placeholder={`Default: ${registryItem.defaults.ogDescription}`}
                    maxLength={300}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to inherit the Meta Description above.
                  </p>
                </div>

                {/* OG Image Upload */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Custom Social Share Image</Label>
                  <ImageUpload value={ogImage} onChange={setOgImage} folder="seo" />
                  <p className="text-[11px] text-muted-foreground">
                    Recommended dimensions: 1200 x 630 px (1.91:1 aspect ratio). Supported: PNG,
                    JPG, WebP.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {isCustomized && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetDialogOpen(true)}
                    disabled={isSubmitting || isResetting}
                    className="text-destructive hover:bg-destructive/10 text-xs"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Reset to Default
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" asChild disabled={isSubmitting}>
                  <Link href="/admin/seo">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-navy hover:bg-navy/90 text-primary-foreground font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: DUAL LIVE PREVIEWS (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6 space-y-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Live Search &amp; Social Previews
              </div>

              {/* 1. Google Search Preview Card */}
              <Card className="border-border shadow-xs overflow-hidden">
                <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border">
                  <CardTitle className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
                    Google Search Snippet Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 bg-background">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-[11px] font-bold">
                      A
                    </div>
                    <div className="text-xs leading-tight">
                      <span className="font-medium text-foreground block">Altair Academy</span>
                      <span className="text-muted-foreground text-[11px] block truncate max-w-[260px]">
                        https://altairacademy.com{effectivePath}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base text-blue-700 hover:underline cursor-pointer font-medium leading-snug line-clamp-2">
                    {previewTitle}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {previewDesc}
                  </p>

                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Indexing:{" "}
                      <strong
                        className={indexing === "NOINDEX" ? "text-destructive" : "text-emerald-600"}
                      >
                        {indexing === "NOINDEX" ? "Noindex" : "Index"}
                      </strong>
                    </span>
                    <span>{descLen} chars</span>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Social Share Preview Card */}
              <Card className="border-border shadow-xs overflow-hidden">
                <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border">
                  <CardTitle className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
                    Social Share Card Preview (Facebook, X, LinkedIn)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 bg-background">
                  <div className="relative aspect-[1.91/1] w-full bg-muted border-b border-border">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt={previewOgTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No Preview Image
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      ALTAIRACADEMY.COM
                    </span>
                    <div className="text-xs font-bold text-foreground line-clamp-2">
                      {previewOgTitle}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                      {previewOgDesc}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Info hint */}
              <div className="p-3.5 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">Multi-tier Resolution Notice:</div>
                <p className="text-[11px] leading-relaxed">
                  When a public page renders, overrides defined here take precedence over registry
                  defaults. If individual records (such as specific courses or news articles)
                  specify their own SEO tags, those take highest priority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Page SEO to Default?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all custom overrides for <strong>{registryItem.label}</strong> and
              revert to built-in code baseline defaults.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isResetting ? "Resetting..." : "Reset to Default"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
