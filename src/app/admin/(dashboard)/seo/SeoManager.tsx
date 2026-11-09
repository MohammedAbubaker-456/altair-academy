/**
 * Admin SEO Manager Interactive Client Component
 *
 * Provides site-wide SEO defaults management, filtered registry overview table,
 * source indicators, indexing badges, and on-demand reset to baseline defaults.
 *
 * Location: src/app/admin/(dashboard)/seo/SeoManager.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PageSeo, SiteSeo } from "@prisma/client";
import type { SeoRegistryItem, SeoPageGroup } from "@/lib/seo/registry";
import { saveSiteSeo, resetSiteSeo, resetPageSeo } from "@/app/admin/seo/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ExternalLink,
  Edit,
  RotateCcw,
  Globe,
  Settings2,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface SeoManagerProps {
  registryItems: SeoRegistryItem[];
  pageSeoMap: Record<string, PageSeo>;
  initialSiteSeo: SiteSeo | null;
}

const SAMPLE_TEMPLATE_PATHS: Record<string, string> = {
  "course-detail": "/courses/ultrasonic-testing-level-2",
  "news-detail": "/news/welding-inspection-certifications",
  "team-detail": "/team/shaik-khaja-mohiuddin",
  "legal-detail": "/privacy",
};

export function SeoManager({
  registryItems,
  pageSeoMap,
  initialSiteSeo,
}: SeoManagerProps) {
  const router = useRouter();

  // Site defaults card state
  const [isSiteDefaultsOpen, setIsSiteDefaultsOpen] = React.useState(false);
  const [siteName, setSiteName] = React.useState(initialSiteSeo?.siteName ?? "");
  const [defaultDescription, setDefaultDescription] = React.useState(
    initialSiteSeo?.defaultDescription ?? "",
  );
  const [defaultOgImage, setDefaultOgImage] = React.useState<string | null>(
    initialSiteSeo?.defaultOgImage ?? null,
  );
  const [twitterSite, setTwitterSite] = React.useState(initialSiteSeo?.twitterSite ?? "");
  const [isSavingSite, setIsSavingSite] = React.useState(false);
  const [isResettingSite, setIsResettingSite] = React.useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState<"ALL" | "CUSTOMISED" | "DEFAULT">("ALL");
  const [groupFilter, setGroupFilter] = React.useState<string>("ALL");

  // Reset dialog state
  const [resetTargetKey, setResetTargetKey] = React.useState<string | null>(null);
  const [isResettingPage, setIsResettingPage] = React.useState(false);

  // Counts
  const totalCount = registryItems.length;
  const customizedCount = registryItems.filter((item) => {
    const row = pageSeoMap[item.key];
    return Boolean(
      row &&
        (row.title ||
          row.description ||
          row.ogTitle ||
          row.ogDescription ||
          row.ogImage ||
          row.canonicalPath ||
          row.noIndex !== null),
    );
  }).length;
  const defaultCount = totalCount - customizedCount;

  // Handle Save Site Defaults
  const handleSaveSiteDefaults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSite(true);
    try {
      const res = await saveSiteSeo({
        siteName: siteName || null,
        defaultDescription: defaultDescription || null,
        defaultOgImage: defaultOgImage || null,
        twitterSite: twitterSite || null,
      });

      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to save site defaults: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setIsSavingSite(false);
    }
  };

  // Handle Reset Site Defaults
  const handleResetSiteDefaults = async () => {
    setIsResettingSite(true);
    try {
      const res = await resetSiteSeo();
      if (res.ok) {
        toast.success(res.message);
        setSiteName("");
        setDefaultDescription("");
        setDefaultOgImage(null);
        setTwitterSite("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to reset site defaults");
    } finally {
      setIsResettingSite(false);
    }
  };

  // Handle Reset Page Override
  const handleConfirmResetPage = async () => {
    if (!resetTargetKey) return;
    setIsResettingPage(true);
    try {
      const res = await resetPageSeo(resetTargetKey);
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to reset page SEO");
    } finally {
      setIsResettingPage(false);
      setResetTargetKey(null);
    }
  };

  // Filtered registry list
  const filteredItems = registryItems.filter((item) => {
    const row = pageSeoMap[item.key];
    const isCustomized = Boolean(
      row &&
        (row.title ||
          row.description ||
          row.ogTitle ||
          row.ogDescription ||
          row.ogImage ||
          row.canonicalPath ||
          row.noIndex !== null),
    );

    // Source Filter
    if (sourceFilter === "CUSTOMISED" && !isCustomized) return false;
    if (sourceFilter === "DEFAULT" && isCustomized) return false;

    // Group Filter
    if (groupFilter !== "ALL" && item.group !== groupFilter) return false;

    // Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchLabel = item.label.toLowerCase().includes(term);
      const matchKey = item.key.toLowerCase().includes(term);
      const matchPath = item.path.toLowerCase().includes(term);
      const matchTitle = (row?.title || item.defaults.title).toLowerCase().includes(term);
      const matchDesc = (row?.description || item.defaults.description).toLowerCase().includes(term);
      if (!matchLabel && !matchKey && !matchPath && !matchTitle && !matchDesc) return false;
    }

    return true;
  });

  // Group items by group name
  const groups: SeoPageGroup[] = ["Main pages", "Detail pages", "Legal"];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">
            SEO &amp; Meta Tags Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage titles, descriptions, social share cards, and search engine indexing across all public pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-medium py-1 px-3">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2" />
            {customizedCount} Customised / {totalCount} Pages
          </Badge>
        </div>
      </div>

      {/* Global Site Defaults Card */}
      <Card className="border-border shadow-xs">
        <button
          type="button"
          onClick={() => setIsSiteDefaultsOpen(!isSiteDefaultsOpen)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-muted/20 hover:bg-muted/40 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10 text-navy">
              <Settings2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-display">Global Site Defaults</CardTitle>
                {initialSiteSeo ? (
                  <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 text-[11px] py-0">
                    Customised
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-[11px] py-0">
                    System Defaults
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-0.5">
                Site name, default meta description, default Open Graph image, and Twitter / X handle.
              </CardDescription>
            </div>
          </div>
          <div className="text-muted-foreground">
            {isSiteDefaultsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </button>

        {isSiteDefaultsOpen && (
          <CardContent className="p-5 sm:p-6 border-t border-border">
            <form onSubmit={handleSaveSiteDefaults} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Site Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="site-name">Default Site Name</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Altair Academy"
                    maxLength={80}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Used as the brand suffix in browser tabs and search snippets.
                  </p>
                </div>

                {/* Twitter Handle */}
                <div className="space-y-1.5">
                  <Label htmlFor="twitter-handle">Twitter / X Site Handle</Label>
                  <Input
                    id="twitter-handle"
                    value={twitterSite}
                    onChange={(e) => setTwitterSite(e.target.value)}
                    placeholder="@altair_academy"
                    maxLength={16}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Format: @handle (used for twitter:site card attribution).
                  </p>
                </div>
              </div>

              {/* Default Description */}
              <div className="space-y-1.5">
                <Label htmlFor="default-desc">Default Meta Description</Label>
                <Textarea
                  id="default-desc"
                  rows={2}
                  value={defaultDescription}
                  onChange={(e) => setDefaultDescription(e.target.value)}
                  placeholder="Altair Academy delivers accredited NDT, corrosion, BIM and management system training led by practising industry specialists."
                  maxLength={300}
                />
                <p className="text-[11px] text-muted-foreground">
                  Global fallback description when a page does not supply its own.
                </p>
              </div>

              {/* Default OG Image */}
              <div className="space-y-1.5">
                <Label>Default Social Share Image (1200 x 630 px)</Label>
                <ImageUpload
                  value={defaultOgImage}
                  onChange={setDefaultOgImage}
                  folder="seo"
                />
                <p className="text-[11px] text-muted-foreground">
                  Recommended size: 1200 x 630 px. Shown when sharing links with no specific image.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                {initialSiteSeo ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetSiteDefaults}
                    disabled={isResettingSite || isSavingSite}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    {isResettingSite && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    Reset to System Defaults
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingSite || isResettingSite}
                  className="bg-navy hover:bg-navy/90 text-primary-foreground font-medium"
                >
                  {isSavingSite ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving Defaults...
                    </>
                  ) : (
                    "Save Site Defaults"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by page name, path, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter Tabs */}
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            <button
              type="button"
              onClick={() => setSourceFilter("ALL")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sourceFilter === "ALL"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("CUSTOMISED")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sourceFilter === "CUSTOMISED"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Customised ({customizedCount})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("DEFAULT")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sourceFilter === "DEFAULT"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Default ({defaultCount})
            </button>
          </div>

          {/* Group Dropdown */}
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[150px] text-xs h-9">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Groups</SelectItem>
              <SelectItem value="Main pages">Main pages</SelectItem>
              <SelectItem value="Detail pages">Detail pages</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pages Table Grouped */}
      <div className="space-y-6">
        {groups.map((group) => {
          const groupItems = filteredItems.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <Card key={group} className="border-border overflow-hidden shadow-xs">
              <CardHeader className="bg-muted/20 py-3 px-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
                    {group}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {groupItems.length} {groupItems.length === 1 ? "page" : "pages"}
                  </span>
                </div>
              </CardHeader>
              <div className="divide-y divide-border overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/10">
                      <th className="py-2.5 px-4 w-[28%]">Page &amp; Path</th>
                      <th className="py-2.5 px-3 w-[12%]">Source</th>
                      <th className="py-2.5 px-3 w-[26%]">Effective Title</th>
                      <th className="py-2.5 px-3 w-[12%]">Length</th>
                      <th className="py-2.5 px-3 w-[10%]">Indexing</th>
                      <th className="py-2.5 px-4 w-[12%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {groupItems.map((item) => {
                      const row = pageSeoMap[item.key];
                      const isCustomized = Boolean(
                        row &&
                          (row.title ||
                            row.description ||
                            row.ogTitle ||
                            row.ogDescription ||
                            row.ogImage ||
                            row.canonicalPath ||
                            row.noIndex !== null),
                      );

                      const effectiveTitle = row?.title || item.defaults.title;
                      const effectiveDescription = row?.description || item.defaults.description;
                      const descLength = effectiveDescription.length;
                      const isDescInRange = descLength >= 70 && descLength <= 160;

                      // Indexing determination
                      const isNoIndex =
                        row?.noIndex !== null && row?.noIndex !== undefined
                          ? row.noIndex
                          : item.defaults.noIndex;

                      const liveUrl =
                        SAMPLE_TEMPLATE_PATHS[item.key] || item.path;

                      return (
                        <tr
                          key={item.key}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          {/* Page Name & Path */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <span>{item.label}</span>
                                {item.isTemplate && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] py-0 px-1 font-normal"
                                  >
                                    Template
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <code className="text-[11px] bg-muted/60 px-1 py-0.2 rounded font-mono">
                                  {item.path}
                                </code>
                                <Link
                                  href={liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View page on website"
                                  className="text-muted-foreground hover:text-brand-red p-0.5"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          </td>

                          {/* Source Badge */}
                          <td className="py-3 px-3">
                            {isCustomized ? (
                              <Badge
                                variant="outline"
                                className="text-emerald-700 bg-emerald-50 border-emerald-300 text-xs py-0.5 font-medium"
                              >
                                Customised
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground text-xs py-0.5 font-normal"
                              >
                                Default
                              </Badge>
                            )}
                          </td>

                          {/* Effective Title */}
                          <td className="py-3 px-3">
                            <div className="line-clamp-1 text-xs" title={effectiveTitle}>
                              {row?.title ? (
                                <span className="font-medium text-foreground">
                                  {row.title}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">
                                  {item.defaults.title}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Description Length */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                                isDescInRange
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                                  : "text-amber-700 bg-amber-50 border-amber-300"
                              }`}
                              title={`${descLength} characters (recommended: 70–160)`}
                            >
                              {descLength} ch
                            </span>
                          </td>

                          {/* Indexing Badge */}
                          <td className="py-3 px-3">
                            {isNoIndex ? (
                              <Badge
                                variant="destructive"
                                className="text-[11px] py-0 font-medium"
                              >
                                Noindex
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-emerald-600 border-emerald-400 text-[11px] py-0 font-medium"
                              >
                                Index
                              </Badge>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 px-2.5 text-xs"
                              >
                                <Link href={`/admin/seo/${item.key}`}>
                                  <Edit className="mr-1 h-3 w-3" /> Edit
                                </Link>
                              </Button>

                              {isCustomized && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setResetTargetKey(item.key)}
                                  className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                                  title="Reset to baseline default"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-dashed border-border p-8">
            <Globe className="mx-auto h-8 w-8 text-muted-foreground" />
            <h4 className="mt-2 text-sm font-semibold text-foreground">No SEO Pages Found</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              No pages match the active search term or filter criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSourceFilter("ALL");
                setGroupFilter("ALL");
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Resetting Page */}
      <AlertDialog
        open={Boolean(resetTargetKey)}
        onOpenChange={(open) => !open && setResetTargetKey(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Page SEO to Baseline Default?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the customized database overrides for this page. The page will immediately
              revert to using its built-in code defaults. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingPage}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmResetPage}
              disabled={isResettingPage}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isResettingPage ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset to Default"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
