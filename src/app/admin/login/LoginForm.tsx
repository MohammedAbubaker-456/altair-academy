/**
 * Admin Login Interactive Form
 *
 * Client form component handling admin credential input, validation,
 * error presentation, and submission to the login server action.
 *
 * Location: src/app/admin/login/LoginForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { loginAdminAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await loginAdminAction(data);
        if (result.ok) {
          // Use full page reload to ensure session headers and layout initialize cleanly
          window.location.href = "/admin";
        } else {
          setServerError(result.message);
        }
      } catch {
        setServerError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Card className="border border-border/80 shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-6 space-y-4">
          {serverError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter Your Email"
                className="pl-9"
                disabled={isPending}
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter Your Password"
                className="pl-9"
                disabled={isPending}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6">
          <Button
            type="submit"
            className="w-full bg-navy hover:bg-navy/90 text-primary-foreground font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
