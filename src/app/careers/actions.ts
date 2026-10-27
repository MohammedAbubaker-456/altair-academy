/**
 * Public Careers Server Actions
 *
 * Handles candidate job applications and resume uploads with Zod validation,
 * honeypot protection, HMAC rate limiting, and safe rollback of saved private files.
 *
 * Location: src/app/careers/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { applicationSchema } from "@/lib/validation/application";
import { checkRateLimit, recordRateLimitAttempt } from "@/lib/rate-limit";
import { saveResume, deleteResume, type SaveResumeResult } from "@/lib/private-storage";

export interface ApplicationFormState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitApplication(
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const rawInput = {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    specialisation: (formData.get("specialisation") as string) || null,
    message: (formData.get("message") as string) || null,
    website: (formData.get("website") as string) ?? "",
  };

  const resumeFile = formData.get("resume") as File | null;

  // 1. Validate form fields
  const parseResult = applicationSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstErr = Object.values(fieldErrors).flat()[0];
    return {
      ok: false,
      message: firstErr || "Please verify your input and try again.",
      fieldErrors,
    };
  }

  const { name, email, phone, specialisation, message, website } = parseResult.data;

  // 2. Honeypot check (silently succeed if bot fills hidden website input)
  if (website && website.trim() !== "") {
    return {
      ok: true,
      message: "Thanks — your application has been noted. Our team will be in touch shortly.",
    };
  }

  // 3. Rate limiting check (3 applications per hour per client)
  const rateLimit = await checkRateLimit("application");
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: rateLimit.message,
    };
  }

  // 4. Save resume file if provided
  let savedResume: SaveResumeResult | null = null;
  const hasFile = resumeFile && typeof resumeFile === "object" && resumeFile.size > 0;

  if (hasFile) {
    try {
      savedResume = await saveResume(resumeFile);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to process the uploaded resume.";
      return {
        ok: false,
        message: errorMsg,
        fieldErrors: { resume: [errorMsg] },
      };
    }
  }

  // 5. Create database record; delete saved file if database write fails
  try {
    await recordRateLimitAttempt("application");

    await db.careerApplication.create({
      data: {
        name,
        email,
        phone,
        specialisation: specialisation || null,
        message: message || null,
        resumeOriginalName: savedResume?.resumeOriginalName || null,
        resumeStoredName: savedResume?.storedName || null,
        resumeMime: savedResume?.resumeMime || null,
        resumeSize: savedResume?.resumeSize || null,
        status: "NEW",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");

    return {
      ok: true,
      message: "Thanks — your application has been noted. Our team will be in touch shortly.",
    };
  } catch (dbError) {
    console.error("[submitApplication] Database write error:", dbError);

    // Rollback saved file to prevent orphaned files on disk
    if (savedResume?.storedName) {
      await deleteResume(savedResume.storedName);
    }

    return {
      ok: false,
      message: "An unexpected error occurred while saving your application. Please try again.",
    };
  }
}
