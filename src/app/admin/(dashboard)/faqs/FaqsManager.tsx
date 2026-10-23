/**
 * FAQs Management Interactive Client View
 *
 * Provides FAQ list table, create/edit modal dialog, order sequencing,
 * optimistic status switches, and deletion confirmations.
 *
 * Location: src/app/admin/(dashboard)/faqs/FaqsManager.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { faqSchema, type FaqInput } from "@/lib/validation/faq";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  setFaqStatusAction,
} from "@/app/admin/faqs/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, ExternalLink, Loader2, HelpCircle } from "lucide-react";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  order: number;
  status: "ACTIVE" | "INACTIVE";
}

interface FaqsManagerProps {
  faqs: FaqRow[];
}

export function FaqsManager({ faqs }: FaqsManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingFaq, setEditingFaq] = React.useState<FaqRow | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      order: 0,
      status: "ACTIVE",
    },
  });

  const handleOpenAdd = () => {
    setEditingFaq(null);
    reset({
      question: "",
      answer: "",
      order: faqs.length,
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (faq: FaqRow) => {
    setEditingFaq(faq);
    reset({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      status: faq.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FaqInput) => {
    setIsSubmitting(true);
    try {
      if (editingFaq) {
        const result = await updateFaqAction(editingFaq.id, data);
        if (result.ok) {
          toast.success(result.message);
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createFaqAction(data);
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

  const handleDelete = async (id: string) => {
    const result = await deleteFaqAction(id);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage FAQs served on the Altair Academy home page accordion. ({faqs.length} FAQs)
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-navy hover:bg-navy/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="h-8 w-8 text-muted-foreground/60" />
                    <p>No FAQs found. Create your first FAQ above.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-mono text-xs">{faq.order}</TableCell>
                  <TableCell className="font-medium text-foreground max-w-xs">
                    {faq.question}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                    {faq.answer}
                  </TableCell>
                  <TableCell>
                    <StatusSwitch
                      id={faq.id}
                      initialStatus={faq.status}
                      onToggle={setFaqStatusAction}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {faq.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link
                          href="/#faq"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview in FAQ section"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(faq)}
                      title="Edit FAQ"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteDialog
                      title="Delete FAQ?"
                      description="Are you sure you want to delete this FAQ entry? This action cannot be undone."
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete FAQ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      onConfirm={() => handleDelete(faq.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingFaq ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editingFaq
                ? "Update question text or answer content."
                : "Create a question and answer for prospective students."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                placeholder="e.g. What qualifications do I need to attend an NDT course?"
                {...register("question")}
              />
              {errors.question && (
                <p className="text-xs text-destructive">{errors.question.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                rows={4}
                placeholder="Comprehensive explanation addressing the student's question..."
                {...register("answer")}
              />
              {errors.answer && <p className="text-xs text-destructive">{errors.answer.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="faq-order">Display Order</Label>
                <Input id="faq-order" type="number" min={0} {...register("order")} />
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>
            </div>

            <DialogFooter className="pt-2">
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
                className="bg-navy hover:bg-navy/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingFaq ? (
                  "Update FAQ"
                ) : (
                  "Create FAQ"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
