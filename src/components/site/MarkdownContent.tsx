/**
 * Safe Markdown Content Renderer
 *
 * Renders Markdown safely without raw HTML or image injection.
 * Enforces strict URL scheme validation (rejecting javascript:, data:),
 * automatically applies rel="noopener noreferrer" to external links,
 * and maps elements to Altair Academy design tokens (font-display, text-muted-foreground, brand-red).
 *
 * Location: src/components/site/MarkdownContent.tsx
 * Type: Shared Component (Server and Client compatible)
 */

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { isSafeUrl } from "@/lib/safe-url";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const markdownComponents: Components = {
  // Reject images completely for security and layout consistency
  img: () => null,

  // Custom safe link component
  a: ({ href, children, ...props }) => {
    if (!href || !isSafeUrl(href)) {
      return <span>{children}</span>;
    }

    const isExternal = href.startsWith("http://") || href.startsWith("https://");

    return (
      <a
        href={href}
        className="font-medium text-brand-red underline underline-offset-4 hover:text-brand-red/80 transition-colors"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },

  h1: ({ children, ...props }) => (
    <h1
      className="font-display text-3xl font-bold tracking-tight text-primary mt-8 mb-4 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }) => (
    <h2
      className="font-display text-2xl font-bold tracking-tight text-primary mt-7 mb-3 first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }) => (
    <h3
      className="font-display text-xl font-bold tracking-tight text-primary mt-6 mb-2 first:mt-0"
      {...props}
    >
      {children}
    </h3>
  ),

  h4: ({ children, ...props }) => (
    <h4 className="font-display text-lg font-bold text-primary mt-4 mb-2 first:mt-0" {...props}>
      {children}
    </h4>
  ),

  p: ({ children, ...props }) => (
    <p className="leading-relaxed text-muted-foreground" {...props}>
      {children}
    </p>
  ),

  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 space-y-2 text-muted-foreground my-4" {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 space-y-2 text-muted-foreground my-4" {...props}>
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),

  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-brand-red/60 pl-4 py-1 italic text-muted-foreground/90 my-4 bg-muted/30 rounded-r"
      {...props}
    >
      {children}
    </blockquote>
  ),

  code: ({ children, className, ...props }) => (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  ),

  pre: ({ children, ...props }) => (
    <pre
      className="overflow-x-auto rounded-lg bg-navy p-4 text-xs font-mono text-primary-foreground my-4"
      {...props}
    >
      {children}
    </pre>
  ),

  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),

  hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) return null;

  return (
    <div className={cn("space-y-4 text-base text-muted-foreground leading-relaxed", className)}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}

/**
 * Client-Side Preview variant for admin forms.
 */
export function MarkdownPreview({
  content,
  placeholder = "Nothing to preview yet.",
  className,
}: {
  content: string;
  placeholder?: string;
  className?: string;
}) {
  if (!content || !content.trim()) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground text-center italic bg-muted/20",
          className,
        )}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-6 shadow-xs max-h-[500px] overflow-y-auto",
        className,
      )}
    >
      {/* <MarkdownContent content={content} /> */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
