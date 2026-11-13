/**
 * Team Member Create / Edit Form Component
 *
 * Full-featured interactive form for team member profiles, faculty placement,
 * expertise tag chips, and server disk image upload.
 *
 * Location: src/app/admin/(dashboard)/team/TeamForm.tsx
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
import { teamMemberSchema, type TeamMemberInput } from "@/lib/validation/team";
import { slugify } from "@/lib/slugify";
import { createTeamMemberAction, updateTeamMemberAction } from "@/app/admin/team/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SeoFormSection } from "@/components/admin/SeoFormSection";
import { Loader2, ArrowLeft, X, Plus } from "lucide-react";
import type { TeamPlacement } from "@/types/team";

interface TeamMemberInitialData {
  id: string;
  name: string;
  slug: string;
  role: string;
  shortBio: string;
  instructorName: string | null;
  instructorRole: string | null;
  fullBio: string | null;
  expertise: string[];
  image: string | null;
  placements: TeamPlacement[];
  managementOrder: number;
  instructorOrder: number;
  status: "ACTIVE" | "INACTIVE";
  metaTitle?: string | null;
  metaDescription?: string | null;
}

interface TeamFormProps {
  initialData?: TeamMemberInitialData | null;
}

export function TeamForm({ initialData }: TeamFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [expertiseInput, setExpertiseInput] = React.useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      role: initialData?.role ?? "",
      shortBio: initialData?.shortBio ?? "",
      instructorName: initialData?.instructorName ?? null,
      instructorRole: initialData?.instructorRole ?? null,
      fullBio: initialData?.fullBio ?? null,
      expertise: initialData?.expertise ?? [],
      image: initialData?.image ?? null,
      placements: initialData?.placements ?? ["MANAGEMENT"],
      managementOrder: initialData?.managementOrder ?? 0,
      instructorOrder: initialData?.instructorOrder ?? 0,
      status: initialData?.status ?? "ACTIVE",
      metaTitle: initialData?.metaTitle ?? null,
      metaDescription: initialData?.metaDescription ?? null,
    },
  });

  const currentExpertise = watch("expertise") || [];
  const currentPlacements = watch("placements") || [];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value, { shouldValidate: true });
    if (!initialData) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  const handleAddExpertise = () => {
    const trimmed = expertiseInput.trim();
    if (trimmed && !currentExpertise.includes(trimmed)) {
      setValue("expertise", [...currentExpertise, trimmed], { shouldValidate: true });
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (tag: string) => {
    setValue(
      "expertise",
      currentExpertise.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  };

  const handlePlacementToggle = (placement: TeamPlacement, checked: boolean) => {
    if (checked) {
      setValue("placements", [...currentPlacements, placement], { shouldValidate: true });
    } else {
      setValue(
        "placements",
        currentPlacements.filter((p) => p !== placement),
        { shouldValidate: true },
      );
    }
  };

  const onSubmit = async (data: TeamMemberInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateTeamMemberAction(initialData.id, data);
        handleAdminActionResult(result, () => {
          router.push("/admin/team");
          router.refresh();
        });
      } else {
        const result = await createTeamMemberAction(data);
        handleAdminActionResult(result, () => {
          router.push("/admin/team");
          router.refresh();
        });
      }
    } catch (err) {
      console.error("[TeamForm] Submit error:", err);
      toast.error("An unexpected error occurred. Please refresh the page.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/team">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            {initialData ? `Edit Member: ${initialData.name}` : "Add Team Member"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update leadership profile or instructor credentials."
              : "Create a new leadership or faculty member record."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Placements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Placements & Roles</CardTitle>
            <CardDescription>
              Select where this person should be showcased on the website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox
                  id="placement-mgmt"
                  checked={currentPlacements.includes("MANAGEMENT")}
                  onCheckedChange={(checked) => handlePlacementToggle("MANAGEMENT", !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="placement-mgmt" className="font-semibold cursor-pointer">
                    Executive Leadership
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display on the About page leadership grid and individual /team/[slug] page.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox
                  id="placement-inst"
                  checked={currentPlacements.includes("INSTRUCTOR")}
                  onCheckedChange={(checked) => handlePlacementToggle("INSTRUCTOR", !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="placement-inst" className="font-semibold cursor-pointer">
                    Technical Instructor
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display on the Instructors page with bio and technical expertise chips.
                  </p>
                </div>
              </div>
            </div>
            {errors.placements && (
              <p className="text-xs text-destructive">{errors.placements.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Core Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Core Leadership Profile</CardTitle>
            <CardDescription>Primary name and leadership bio details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="member-name">Full Name</Label>
                <Input
                  id="member-name"
                  placeholder="e.g. Dr. Jane Doe"
                  {...register("name")}
                  onChange={handleNameChange}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-slug">URL Slug</Label>
                <Input id="member-slug" placeholder="e.g. jane-doe" {...register("slug")} />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-role">Management Role</Label>
              <Input
                id="member-role"
                placeholder="e.g. Chief Executive Officer"
                {...register("role")}
              />
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-shortBio">Short Bio (Team Card & Profile)</Label>
              <Textarea
                id="member-shortBio"
                rows={3}
                placeholder="Executive biography highlighting leadership background..."
                {...register("shortBio")}
              />
              {errors.shortBio && (
                <p className="text-xs text-destructive">{errors.shortBio.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructor Specific Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Instructor Faculty Credentials</CardTitle>
            <CardDescription>
              Alternative title, full biography, and expertise specializations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="member-instructorName">Instructor Display Name (Optional)</Label>
                <Input
                  id="member-instructorName"
                  placeholder="e.g. Mr. Sirajul Hameed Masroor"
                  defaultValue={initialData?.instructorName ?? ""}
                  onChange={(e) =>
                    setValue("instructorName", e.target.value.trim() ? e.target.value : null, {
                      shouldValidate: true,
                    })
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave blank to use the primary full name.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-instructorRole">Faculty Role (Optional)</Label>
                <Input
                  id="member-instructorRole"
                  placeholder="e.g. Senior NDT Consultant & Level III Examiner"
                  defaultValue={initialData?.instructorRole ?? ""}
                  onChange={(e) =>
                    setValue("instructorRole", e.target.value.trim() ? e.target.value : null, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-fullBio">Full Biography (Optional)</Label>
              <Textarea
                id="member-fullBio"
                rows={4}
                placeholder="Detailed technical career history, publications, and certifications..."
                defaultValue={initialData?.fullBio ?? ""}
                onChange={(e) =>
                  setValue("fullBio", e.target.value.trim() ? e.target.value : null, {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* Expertise Tag Input */}
            <div className="space-y-2">
              <Label>Areas of Technical Expertise</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. UT / PAUT / TOFD (Press Enter to add)"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddExpertise}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {currentExpertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {currentExpertise.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 bg-navy/10 text-navy font-normal"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Profile Portrait</CardTitle>
            <CardDescription>Square or portrait orientation image.</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUpload value={field.value} onChange={field.onChange} folder="team" />
              )}
            />
          </CardContent>
        </Card>

        {/* Display Order & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Sorting & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="member-mgmtOrder">Management Order</Label>
                <Input
                  id="member-mgmtOrder"
                  type="number"
                  min={0}
                  {...register("managementOrder")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-instOrder">Instructor Order</Label>
                <Input
                  id="member-instOrder"
                  type="number"
                  min={0}
                  {...register("instructorOrder")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-status">Publication Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="member-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Record-Level SEO (Optional) */}
        <SeoFormSection
          metaTitle={watch("metaTitle")}
          metaDescription={watch("metaDescription")}
          showOgImage={false}
          onTitleChange={(val) => setValue("metaTitle", val || null, { shouldValidate: true })}
          onDescriptionChange={(val) =>
            setValue("metaDescription", val || null, { shouldValidate: true })
          }
          fallbackTitle={`${watch("name") || "Member"}, ${watch("role") || "Instructor"} — Altair Academy`}
          fallbackDescription={watch("shortBio") || "Management team profile..."}
          fallbackSlug={watch("slug") || ""}
          fallbackImage={watch("image")}
          basePath="/team/"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link href="/admin/team">Cancel</Link>
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
              "Update Member"
            ) : (
              "Create Member"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
