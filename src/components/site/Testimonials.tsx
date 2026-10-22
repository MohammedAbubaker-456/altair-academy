import { Quote, Star } from "lucide-react";
import { testimonials } from "@/data/site";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const columns = [
  testimonials.slice(0, 3),
  testimonials.slice(3, 6),
  testimonials.slice(6, 9),
];

const cycleDuration = 9;

function TestimonialFan({ stack }: { stack: typeof testimonials }) {
  return (
    <div
      className="relative mx-auto w-full max-w-xs md:max-w-sm px-4"
      style={{ height: "440px" }}
    >
      {stack.map((t, i) => (
        <article
          key={t.name}
          className="testimonial-card flex h-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          style={{ animationDelay: `${-i * 3}s` }}
        >
          {/* Top visual band */}
          <div
            className="testimonial-body flex h-28 shrink-0 items-center justify-center bg-navy-deep md:h-32"
            style={{ animationDelay: `${-i * 3}s` }}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-red text-lg font-bold text-brand-red-foreground shadow-lg ring-4 ring-navy md:size-16">
              {initials(t.name)}
            </span>
          </div>

          {/* Body — only visible on the front card */}
          <div
            className="testimonial-body flex flex-1 flex-col items-center px-6 pt-5 text-center"
            style={{ animationDelay: `${-i * 3}s` }}
          >
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star
                  key={j}
                  className="size-3.5 fill-amber-400 text-amber-400 md:size-4"
                  aria-hidden="true"
                />
              ))}
            </div>

            <h4 className="mt-3 font-display text-base font-semibold text-primary-foreground md:text-lg">
              {t.name}
            </h4>
            <p className="text-xs uppercase tracking-wider text-primary-foreground/60 md:text-sm">
              {t.company}
            </p>

            <p className="mt-3 line-clamp-4 text-sm italic leading-relaxed text-primary-foreground/90 md:text-base">
              “{t.quote}”
            </p>

            <Quote
              className="mt-auto mb-4 size-5 text-brand-red"
              aria-hidden="true"
            />
          </div>
        </article>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <div className="mt-12 md:mt-16">
      <style>
        {`
          @keyframes testimonial-fan {
            0%, 30% {
              transform: translateX(0) rotate(0deg) scale(1);
              z-index: 30;
              background-color: var(--navy);
              opacity: 1;
            }
            33%, 63% {
              transform: translateX(12%) rotate(4deg) scale(0.94);
              z-index: 20;
              background-color: color-mix(in oklab, var(--muted-foreground) 35%, var(--navy));
              opacity: 0.9;
            }
            66%, 96% {
              transform: translateX(-12%) rotate(-4deg) scale(0.94);
              z-index: 10;
              background-color: color-mix(in oklab, var(--muted-foreground) 35%, var(--navy));
              opacity: 0.9;
            }
            100% {
              transform: translateX(0) rotate(0deg) scale(1);
              z-index: 30;
              background-color: var(--navy);
              opacity: 1;
            }
          }
          @keyframes testimonial-body {
            0%, 30% { opacity: 1; }
            33%, 96% { opacity: 0; }
            100% { opacity: 1; }
          }
          .testimonial-card {
            animation: testimonial-fan ${cycleDuration}s infinite ease-in-out;
            position: absolute;
            top: 0;
            left: 5%;
            right: 5%;
            background-color: var(--navy);
          }
          .testimonial-body {
            animation: testimonial-body ${cycleDuration}s infinite ease-in-out;
          }
        `}
      </style>

      <div className="grid grid-cols-1 gap-12 px-4 md:grid-cols-3 md:gap-8 lg:gap-16 lg:px-8">
        {columns.map((stack, colIndex) => (
          <TestimonialFan key={colIndex} stack={stack} />
        ))}
      </div>
    </div>
  );
}
