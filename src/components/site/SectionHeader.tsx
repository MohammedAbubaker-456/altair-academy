import { cn } from "@/lib/utils";

type Props = {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  variant?: "divider" | "plain";
  onDark?: boolean;
  className?: string;
};

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  variant = "divider",
  onDark = false,
  className,
}: Props) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "max-w-2xl",
        centered && "mx-auto text-center",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3", centered && "justify-center")}>
        <span className={cn("eyebrow", onDark && "text-brand-red-foreground/80")}>{label}</span>
        {variant === "divider" ? (
          <span className="h-px w-10 bg-brand-red/60" aria-hidden="true" />
        ) : null}
      </div>
      <h2
        className={cn(
          "mt-3 font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl",
          onDark ? "text-primary-foreground" : "text-primary",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-3 text-base", onDark ? "text-primary-foreground/75" : "text-muted-foreground")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
