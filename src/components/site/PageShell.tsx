import type { ReactNode } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-navy py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className="eyebrow text-brand-red-foreground/80">{eyebrow}</span>
            <h1 className="mt-3 font-display text-4xl font-bold text-primary-foreground">{title}</h1>
            {intro ? (
              <p className="mt-3 max-w-2xl text-primary-foreground/75">{intro}</p>
            ) : null}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
