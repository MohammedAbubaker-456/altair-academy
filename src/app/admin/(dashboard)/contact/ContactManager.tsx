/**
 * Contact Details Management Interactive Client View
 *
 * Provides grouped contact channels by type, add/edit modal with adaptive fields per type,
 * order sequencing, optimistic status switches, deletion confirmation with last-active warning,
 * and a live footer preview reflecting active entries.
 *
 * Location: src/app/admin/(dashboard)/contact/ContactManager.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactDetailSchema, type ContactDetailInput } from "@/lib/validation/contact";
import {
  createContactDetailAction,
  updateContactDetailAction,
  deleteContactDetailAction,
  setContactDetailStatusAction,
} from "@/app/admin/contact/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Clock,
  Share2,
  ExternalLink,
  Eye,
  AlertTriangle,
} from "lucide-react";
import type { ContactType } from "@prisma/client";

export interface ContactDetailRow {
  id: string;
  type: ContactType;
  label: string | null;
  value: string;
  link: string | null;
  order: number;
  status: "ACTIVE" | "INACTIVE";
}

interface ContactManagerProps {
  initialDetails: ContactDetailRow[];
}

const TYPE_CONFIG: Record<
  ContactType,
  {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    valueLabel: string;
    valuePlaceholder: string;
    showLinkLabel: boolean;
    linkLabel: string;
    linkPlaceholder: string;
    linkHelp: string;
  }
> = {
  ADDRESS: {
    title: "Address",
    icon: MapPin,
    description: "Physical academy location and mailing headquarters.",
    valueLabel: "Office / Campus Address",
    valuePlaceholder: "e.g. Dubai Silicon Oasis, DDP, Building A2, Dubai, UAE",
    showLinkLabel: false,
    linkLabel: "Link (Not Used)",
    linkPlaceholder: "",
    linkHelp: "Address entries render as plain text in the footer and contact pages.",
  },
  PHONE: {
    title: "Phone",
    icon: Phone,
    description: "Official phone call lines.",
    valueLabel: "Display Phone Number",
    valuePlaceholder: "e.g. +971 4 123 4567",
    showLinkLabel: true,
    linkLabel: "Tel: Dialing Digits",
    linkPlaceholder: "e.g. +97141234567",
    linkHelp: "Used for clickable tel: links. Must contain 6-15 digits (optional leading +).",
  },
  WHATSAPP: {
    title: "WhatsApp",
    icon: MessageSquare,
    description: "WhatsApp business chat hotline.",
    valueLabel: "Display Number / Label",
    valuePlaceholder: "e.g. +971 50 123 4567",
    showLinkLabel: true,
    linkLabel: "WhatsApp Phone Digits",
    linkPlaceholder: "e.g. 971501234567",
    linkHelp: "Used for https://wa.me/ links. 8-15 digits, digits only, NO leading + sign.",
  },
  EMAIL: {
    title: "Email",
    icon: Mail,
    description: "Official inquiries and admissions email addresses.",
    valueLabel: "Email Address",
    valuePlaceholder: "e.g. info@altairacademy.com",
    showLinkLabel: false,
    linkLabel: "Link (Not Used)",
    linkPlaceholder: "",
    linkHelp: "Rendered as clickable mailto: links automatically.",
  },
  HOURS: {
    title: "Operating Hours",
    icon: Clock,
    description: "Customer service and office operating hours.",
    valueLabel: "Hours Description",
    valuePlaceholder: "e.g. Monday - Friday: 8:00 AM - 5:00 PM GST",
    showLinkLabel: false,
    linkLabel: "Link (Not Used)",
    linkPlaceholder: "",
    linkHelp: "Rendered as plain text schedules in the footer and contact sections.",
  },
  SOCIAL: {
    title: "Social Platforms",
    icon: Share2,
    description: "External social media profile links.",
    valueLabel: "Handle / Display Text",
    valuePlaceholder: "e.g. Altair Academy NDT",
    showLinkLabel: true,
    linkLabel: "Profile Web URL",
    linkPlaceholder: "e.g. https://www.linkedin.com/company/altair-academy",
    linkHelp: "Valid http:// or https:// URL opening in a new tab.",
  },
};

const ORDERED_TYPES: ContactType[] = ["ADDRESS", "PHONE", "WHATSAPP", "EMAIL", "HOURS", "SOCIAL"];

export function ContactManager({ initialDetails }: ContactManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ContactDetailRow | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactDetailInput>({
    resolver: zodResolver(contactDetailSchema),
    defaultValues: {
      type: "PHONE",
      label: "",
      value: "",
      link: "",
      order: 0,
      status: "ACTIVE",
    },
  });

  const selectedType = watch("type") || "PHONE";
  const typeConfig = TYPE_CONFIG[selectedType];

  const handleOpenAdd = (type: ContactType = "PHONE") => {
    setEditingItem(null);
    const sameTypeItems = initialDetails.filter((d) => d.type === type);
    reset({
      type,
      label: "",
      value: "",
      link: "",
      order: sameTypeItems.length,
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: ContactDetailRow) => {
    setEditingItem(item);
    reset({
      type: item.type,
      label: item.label ?? "",
      value: item.value,
      link: item.link ?? "",
      order: item.order,
      status: item.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ContactDetailInput) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const result = await updateContactDetailAction(editingItem.id, data);
        if (result.ok) {
          toast.success(result.message);
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createContactDetailAction(data);
        if (result.ok) {
          toast.success(result.message);
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ContactDetailRow) => {
    const result = await deleteContactDetailAction(item.id);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: "ACTIVE" | "INACTIVE") => {
    const result = await setContactDetailStatusAction(id, newStatus);
    if (result.ok) {
      router.refresh();
    }
    return result;
  };

  // Group items by type
  const grouped = ORDERED_TYPES.map((type) => {
    const items = initialDetails.filter((d) => d.type === type).sort((a, b) => a.order - b.order);
    const activeCount = items.filter((d) => d.status === "ACTIVE").length;
    return { type, items, activeCount, config: TYPE_CONFIG[type] };
  });

  // Calculate active items for footer preview
  const activeItems = initialDetails.filter((d) => d.status === "ACTIVE");
  const previewAddress = activeItems.filter((d) => d.type === "ADDRESS");
  const previewPhones = activeItems.filter((d) => d.type === "PHONE");
  const previewWhatsApp = activeItems.filter((d) => d.type === "WHATSAPP");
  const previewEmails = activeItems.filter((d) => d.type === "EMAIL");
  const previewHours = activeItems.filter((d) => d.type === "HOURS");
  const previewSocials = activeItems.filter((d) => d.type === "SOCIAL");

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Contact Details &amp; Channels
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage address, phone, WhatsApp, email, operating hours, and social media channels.
            Changes update the site footer, contact page, and header instantly.
          </p>
        </div>
        <Button
          onClick={() => handleOpenAdd("PHONE")}
          className="bg-navy hover:bg-navy/90 text-primary-foreground font-medium shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Channel
        </Button>
      </div>

      {/* Live Footer Preview Card */}
      <Card className="border-border/80 bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-brand-red" />
            <CardTitle className="text-base font-display">Live Footer Preview</CardTitle>
          </div>
          <CardDescription>
            Real-time representation of how active channels appear to website visitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6 text-xs text-muted-foreground space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Address & Hours */}
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block mb-1">
                    Address
                  </span>
                  {previewAddress.length > 0 ? (
                    previewAddress.map((addr) => (
                      <p key={addr.id} className="leading-relaxed">
                        {addr.value}
                      </p>
                    ))
                  ) : (
                    <p className="italic text-muted-foreground/60">No active address (hidden)</p>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block mb-1">
                    Hours
                  </span>
                  {previewHours.length > 0 ? (
                    previewHours.map((hr) => (
                      <p key={hr.id} className="leading-relaxed">
                        {hr.value}
                      </p>
                    ))
                  ) : (
                    <p className="italic text-muted-foreground/60">No active hours (hidden)</p>
                  )}
                </div>
              </div>

              {/* Phones & WhatsApp */}
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block mb-1">
                    Phone Numbers
                  </span>
                  {previewPhones.length > 0 ? (
                    <div className="space-y-1">
                      {previewPhones.map((ph) => (
                        <p key={ph.id}>
                          <span className="font-mono text-foreground">{ph.value}</span>
                          {ph.label && (
                            <span className="text-muted-foreground/80 ml-1.5">({ph.label})</span>
                          )}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground/60">No active phone (hidden)</p>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block mb-1">
                    WhatsApp Hotline
                  </span>
                  {previewWhatsApp.length > 0 ? (
                    <div className="space-y-1">
                      {previewWhatsApp.map((wa) => (
                        <p key={wa.id} className="font-mono text-foreground">
                          {wa.value}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground/60">WhatsApp button hidden</p>
                  )}
                </div>
              </div>

              {/* Email & Social */}
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block mb-1">
                    Email
                  </span>
                  {previewEmails.length > 0 ? (
                    <div className="space-y-1">
                      {previewEmails.map((em) => (
                        <p key={em.id} className="text-foreground font-medium">
                          {em.value}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground/60">No active email (hidden)</p>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block mb-1">
                    Social Links ({previewSocials.length})
                  </span>
                  {previewSocials.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {previewSocials.map((soc) => (
                        <span
                          key={soc.id}
                          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] text-foreground font-medium"
                        >
                          {soc.label || soc.value}
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground/60">No active social links</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Tables */}
      <div className="space-y-6">
        {grouped.map(({ type, items, activeCount, config }) => {
          const Icon = config.icon;

          return (
            <Card key={type} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10 text-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-display">{config.title}</CardTitle>
                      <Badge
                        variant={activeCount > 0 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {activeCount} Active / {items.length} Total
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{config.description}</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenAdd(type)}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add {config.title}
                </Button>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground italic">
                    No {config.title.toLowerCase()} entries configured.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Order</TableHead>
                          <TableHead>Value / Display Text</TableHead>
                          {config.showLinkLabel && <TableHead>Link Target</TableHead>}
                          <TableHead>Label / Note</TableHead>
                          <TableHead className="w-32">Status</TableHead>
                          <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const isLastActive = item.status === "ACTIVE" && activeCount === 1;

                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-xs">{item.order}</TableCell>
                              <TableCell className="font-medium text-foreground">
                                {item.value}
                              </TableCell>
                              {config.showLinkLabel && (
                                <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                                  {item.link ? (
                                    <span title={item.link}>{item.link}</span>
                                  ) : (
                                    <span className="italic text-muted-foreground/60">—</span>
                                  )}
                                </TableCell>
                              )}
                              <TableCell className="text-xs text-muted-foreground">
                                {item.label || <span className="italic">—</span>}
                              </TableCell>
                              <TableCell>
                                <StatusSwitch
                                  id={item.id}
                                  initialStatus={item.status}
                                  onToggle={handleToggleStatus}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEdit(item)}
                                    title="Edit entry"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <DeleteDialog
                                    title={`Delete ${config.title} entry?`}
                                    description={
                                      isLastActive
                                        ? `WARNING: This is the ONLY active ${config.title.toLowerCase()} entry. Deleting it will cause this contact channel to disappear completely from the footer and contact sections across the website.`
                                        : `Are you sure you want to delete "${item.value}"? This action cannot be undone.`
                                    }
                                    trigger={
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        title="Delete entry"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    }
                                    onConfirm={() => handleDelete(item)}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingItem ? `Edit ${typeConfig.title}` : `Add Contact Channel`}
            </DialogTitle>
            <DialogDescription>
              {typeConfig.description} Adaptive fields ensure proper formatting for public display.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Channel Type */}
            <div className="space-y-1.5">
              <Label htmlFor="contact-type">Channel Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val as ContactType)}
                    disabled={!!editingItem}
                  >
                    <SelectTrigger id="contact-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDERED_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {TYPE_CONFIG[t].title} ({t})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            {/* Value Field (Adaptive) */}
            <div className="space-y-1.5">
              <Label htmlFor="contact-value">{typeConfig.valueLabel}</Label>
              <Input
                id="contact-value"
                placeholder={typeConfig.valuePlaceholder}
                {...register("value")}
              />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>

            {/* Link Field (Shown for PHONE, WHATSAPP, SOCIAL) */}
            {typeConfig.showLinkLabel && (
              <div className="space-y-1.5">
                <Label htmlFor="contact-link">{typeConfig.linkLabel}</Label>
                <Input
                  id="contact-link"
                  placeholder={typeConfig.linkPlaceholder}
                  {...register("link")}
                />
                <p className="text-[11px] text-muted-foreground">{typeConfig.linkHelp}</p>
                {errors.link && <p className="text-xs text-destructive">{errors.link.message}</p>}
              </div>
            )}

            {/* Optional Label / Platform */}
            <div className="space-y-1.5">
              <Label htmlFor="contact-label">
                {selectedType === "SOCIAL" ? "Platform Name" : "Admin Label / Office (Optional)"}
              </Label>
              <Input
                id="contact-label"
                placeholder={
                  selectedType === "SOCIAL"
                    ? "e.g. LinkedIn, YouTube, Facebook"
                    : "e.g. Headquarters, Toll Free, Support"
                }
                {...register("label")}
              />
              {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
            </div>

            {/* Order & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-order">Display Order</Label>
                <Input
                  id="contact-order"
                  type="number"
                  min={0}
                  max={9999}
                  {...register("order", { valueAsNumber: true })}
                />
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="contact-status">
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-navy hover:bg-navy/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingItem ? (
                  "Update Channel"
                ) : (
                  "Add Channel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
