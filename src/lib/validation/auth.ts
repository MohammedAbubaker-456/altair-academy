/**
 * Authentication Validation Schemas
 *
 * Defines Zod schemas for admin login and password change forms.
 * Enforces input constraints and formatting.
 *
 * Location: src/lib/validation/auth.ts
 * Type: Shared Module
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(100),
  password: z.string().min(1, "Password is required").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(128),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Please confirm your new password").max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
