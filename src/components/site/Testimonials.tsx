// /**
//  * Testimonials Reel Carousel
//  *
//  * Interactive client carousel featuring a vertical scroll reel and animated
//  * typography for student and employer reviews.
//  *
//  * Location: src/components/site/Testimonials.tsx
//  * Type: Client Component ("use client")
//  */

// "use client";

// import * as React from "react";
// import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

// export interface TestimonialItem {
//   id: string;
//   quote: string;
//   name: string;
//   company: string | null;
// }

// interface TestimonialsProps {
//   testimonials: TestimonialItem[];
// }

// const CELL = 96;
// const GAP = 8;
// const STEP = 3 * (CELL + GAP);
// const REEL_HEIGHT = 312;
// const EXIT_MS = 240;
// const SLIDE_MS = 800;

// function initials(name: string) {
//   return name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
// }

// function cn(...classes: Array<string | false | undefined>) {
//   return classes.filter(Boolean).join(" ");
// }

// function ReelCell() {
//   return (
//     <div
//       aria-hidden="true"
//       className="shrink-0 rounded-xl border border-border bg-gradient-to-br from-secondary to-card opacity-50 blur-[1px]"
//       style={{ width: CELL, height: CELL }}
//     />
//   );
// }

// function FeaturedTile({ name, index }: { name: string; index: number }) {
//   return (
//     <div
//       className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-navy-deep via-navy to-brand-red/60 shadow-xl"
//       style={{ width: CELL, height: CELL }}
//     >
//       <div className="absolute inset-0 bg-white/5" />

//       <div className="absolute -right-8 -top-8 size-24 rounded-full bg-brand-red/30 blur-2xl" />

//       <span className="relative flex size-14 items-center justify-center rounded-full border border-white/30 bg-brand-red text-xl font-bold text-brand-red-foreground shadow-lg ring-4 ring-white/10">
//         {initials(name)}
//       </span>

//       <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white/50">
//         {String(index + 1).padStart(2, "0")}
//       </span>
//     </div>
//   );
// }

// function AnimatedText({
//   text,
//   startIndex = 0,
//   stagger = 6,
// }: {
//   text: string;
//   startIndex?: number;
//   stagger?: number;
// }) {
//   let index = startIndex;

//   return (
//     <>
//       {text.split(" ").map((word, wordIndex) => (
//         <React.Fragment key={wordIndex}>
//           <span className="inline-block whitespace-nowrap">
//             {Array.from(word).map((char, charIndex) => {
//               const delay = index * stagger;
//               index++;

//               return (
//                 <span
//                   key={`${wordIndex}-${charIndex}`}
//                   className="scroll-reel-char"
//                   style={{ animationDelay: `${delay}ms` }}
//                 >
//                   {char}
//                 </span>
//               );
//             })}
//           </span>
//           {wordIndex < text.split(" ").length - 1 ? " " : ""}
//         </React.Fragment>
//       ))}
//     </>
//   );
// }

// export function Testimonials({ testimonials }: TestimonialsProps) {
//   const [index, setIndex] = React.useState(0);
//   const [displayIndex, setDisplayIndex] = React.useState(0);
//   const [exiting, setExiting] = React.useState(false);
//   const [mounted, setMounted] = React.useState(false);

//   const animating = React.useRef(false);
//   const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([]);

//   const count = testimonials.length;

//   React.useEffect(() => {
//     const activeTimeouts = timeouts.current;
//     const raf = requestAnimationFrame(() => {
//       setMounted(true);
//     });

//     return () => {
//       cancelAnimationFrame(raf);
//       activeTimeouts.forEach(clearTimeout);
//     };
//   }, []);

//   const paginate = React.useCallback(
//     (direction: 1 | -1) => {
//       if (animating.current) return;

//       const next = index + direction;

//       if (next < 0 || next >= count) return;

//       animating.current = true;

//       setIndex(next);
//       setExiting(true);

//       timeouts.current.push(
//         setTimeout(() => {
//           setDisplayIndex(next);
//           setExiting(false);
//         }, EXIT_MS),
//       );

//       timeouts.current.push(
//         setTimeout(() => {
//           animating.current = false;
//         }, SLIDE_MS),
//       );
//     },
//     [index, count],
//   );

//   const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
//     if (event.key === "ArrowRight") {
//       event.preventDefault();
//       paginate(1);
//     }

//     if (event.key === "ArrowLeft") {
//       event.preventDefault();
//       paginate(-1);
//     }
//   };

//   if (count === 0) return null;

//   const current = testimonials[displayIndex];
//   if (!current) return null;

//   const firstTileOffset = (REEL_HEIGHT - CELL) / 2 - 3 * (CELL + GAP);

//   const middleY = firstTileOffset - index * STEP;
//   const sideY = -middleY;

//   const columnStyle = (y: number): React.CSSProperties => ({
//     transform: `translateY(${y}px)`,
//     transition: mounted ? `transform ${SLIDE_MS}ms cubic-bezier(0.65,0,0.35,1)` : "none",
//   });

//   const sideCellCount = 4 + 2 * count;

//   const middleItems = [
//     ...Array.from({ length: 3 }, () => ({ type: "cell" as const })),
//     ...testimonials.flatMap((item, i) => [
//       { type: "featured" as const, item, index: i },
//       ...(i < count - 1 ? [{ type: "cell" as const }, { type: "cell" as const }] : []),
//     ]),
//     ...Array.from({ length: 3 }, () => ({ type: "cell" as const })),
//   ];

//   return (
//     <section className="mt-12 overflow-hidden py-4 md:mt-16">
//       <style>{`
//         @keyframes scroll-reel-char-rise {
//           from {
//             opacity: 0;
//             transform: translateY(18px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes scroll-reel-exit {
//           from {
//             opacity: 1;
//             transform: translateY(0);
//           }
//           to {
//             opacity: 0;
//             transform: translateY(-12px);
//           }
//         }

//         .scroll-reel-char {
//           display: inline-block;
//           opacity: 0;
//           animation: scroll-reel-char-rise 550ms cubic-bezier(.22,1,.36,1) forwards;
//           will-change: transform, opacity;
//         }

//         .scroll-reel-exit {
//           animation: scroll-reel-exit 220ms ease-in forwards;
//         }

//         .scroll-reel-exit .scroll-reel-char {
//           animation: none;
//           opacity: 1;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .scroll-reel-char,
//           .scroll-reel-exit {
//             animation: none !important;
//             opacity: 1 !important;
//             transform: none !important;
//           }
//         }
//       `}</style>

//       <div
//         role="region"
//         aria-roledescription="carousel"
//         aria-label="Customer testimonials"
//         tabIndex={0}
//         onKeyDown={handleKeyDown}
//         className="mx-auto flex w-full max-w-[1060px] flex-col overflow-hidden rounded-2xl border border-border bg-muted shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-[340px] md:flex-row"
//       >
//         {/* LEFT: Vertical Scroll Reel */}
//         <div
//           aria-hidden="true"
//           className="relative h-[312px] w-full shrink-0 overflow-hidden md:w-[380px]"
//           style={{
//             maskImage:
//               "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
//             WebkitMaskImage:
//               "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
//           }}
//         >
//           <div className="absolute inset-0 flex items-center justify-center gap-2">
//             {/* Left column */}
//             <div className="flex shrink-0 flex-col gap-2" style={columnStyle(sideY)}>
//               {Array.from({ length: sideCellCount }).map((_, i) => (
//                 <ReelCell key={i} />
//               ))}
//             </div>

//             {/* Center column */}
//             <div className="flex shrink-0 flex-col gap-2" style={columnStyle(middleY)}>
//               {middleItems.map((item, i) =>
//                 item.type === "featured" ? (
//                   <FeaturedTile key={i} name={item.item.name} index={item.index} />
//                 ) : (
//                   <ReelCell key={i} />
//                 ),
//               )}
//             </div>

//             {/* Right column */}
//             <div className="flex shrink-0 flex-col gap-2" style={columnStyle(sideY)}>
//               {Array.from({ length: sideCellCount }).map((_, i) => (
//                 <ReelCell key={i} />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* RIGHT: Testimonial Content */}
//         <div className="flex min-w-0 flex-1 flex-col justify-between px-6 py-7 sm:px-8 md:py-10">
//           <div className="flex flex-col gap-5">
//             <Quote className="size-11 text-brand-red/70" strokeWidth={1.5} aria-hidden="true" />

//             {/* Animated Quote */}
//             <div className="relative w-full max-w-[460px]" aria-live="polite" aria-atomic="true">
//               <div aria-hidden="true" className="invisible flex min-h-[145px] flex-col gap-5">
//                 <p className="text-lg font-medium leading-relaxed sm:text-xl">{current.quote}</p>

//                 <div>
//                   <p className="text-sm font-semibold">{current.name}</p>
//                   {current.company && (
//                     <p className="text-xs text-muted-foreground">{current.company}</p>
//                   )}
//                 </div>
//               </div>

//               <div
//                 key={displayIndex}
//                 className={cn(
//                   "absolute inset-0 flex flex-col gap-5",
//                   exiting && "scroll-reel-exit",
//                 )}
//               >
//                 <p className="text-lg font-medium leading-relaxed tracking-tight text-foreground sm:text-xl">
//                   “
//                   <AnimatedText text={current.quote} />”
//                 </p>

//                 <div>
//                   <p className="text-sm font-semibold text-foreground">
//                     <AnimatedText text={current.name} startIndex={current.quote.length + 5} />
//                   </p>

//                   {current.company && (
//                     <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
//                       {current.company}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Navigation */}
//           <div className="mt-7 flex items-center justify-between gap-4">
//             <div className="flex items-center gap-1.5">
//               <button
//                 type="button"
//                 onClick={() => paginate(-1)}
//                 disabled={index === 0}
//                 aria-label="Previous testimonial"
//                 className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-all hover:enabled:scale-110 hover:enabled:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//               >
//                 <ChevronLeft className="size-4" />
//               </button>

//               <button
//                 type="button"
//                 onClick={() => paginate(1)}
//                 disabled={index === count - 1}
//                 aria-label="Next testimonial"
//                 className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-all hover:enabled:scale-110 hover:enabled:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//               >
//                 <ChevronRight className="size-4" />
//               </button>
//             </div>

//             <span className="text-xs font-medium tabular-nums text-muted-foreground">
//               {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
//             </span>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

//changes 2 

"use client";

import * as React from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  company: string | null;
}

interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

const CELL = 96;
const GAP = 8;
const STEP = 3 * (CELL + GAP);
const REEL_HEIGHT = 312;
const EXIT_MS = 240;
const SLIDE_MS = 800;

function firstInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* Background tile used throughout the reel */
// function ReelTile({
//   name,
//   active = false,
// }: {
//   name: string;
//   active?: boolean;
// }) {
//   return (
//     <div
//       aria-hidden="true"
//       className={cn(
//         "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
//         "border border-white/20",
//         "bg-gradient-to-br from-navy-deep via-navy to-brand-red/60",
//         "transition-opacity duration-300",
//         active
//           ? "opacity-100 shadow-xl"
//           : "opacity-25"
//       )}
//       style={{ width: CELL, height: CELL }}
//     >
//       <div className="absolute inset-0 bg-white/5" />

//       <div className="absolute -right-8 -top-8 size-24 rounded-full bg-brand-red/30 blur-2xl" />

//       <span
//         className={cn(
//           "relative flex items-center justify-center rounded-full",
//           "border border-white/30 bg-brand-red font-bold text-brand-red-foreground",
//           "shadow-lg ring-4 ring-white/10",
//           active ? "size-14 text-xl" : "size-10 text-base"
//         )}
//       >
//         {firstInitial(name)}
//       </span>
//     </div>
//   );
// }


function ReelTile({
  name,
  active = false,
}: {
  name: string;
  active?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl transition-all duration-300",
        active
          ? "border border-white/20 bg-gradient-to-br from-navy-deep via-navy to-brand-red/60 shadow-xl"
          : "border border-gray-200 bg-gray-200/70 shadow-none"
      )}
      style={{ width: CELL, height: CELL }}
    >
      {active && (
        <>
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute -right-8 -top-8 size-24 rounded-full bg-brand-red/30 blur-2xl" />
        </>
      )}

      <span
        className={cn(
          "relative flex items-center justify-center rounded-full font-bold transition-all duration-300",
          active
            ? "size-14 border border-white/30 bg-brand-red text-xl text-brand-red-foreground shadow-lg ring-4 ring-white/10"
            : "size-10 border border-gray-300 bg-gray-300/60 text-base text-gray-500"
        )}
      >
        {firstInitial(name)}
      </span>
    </div>
  );
}


/* Character-by-character text animation */
function AnimatedText({ text }: { text: string }) {
  let characterIndex = 0;

  const words = text.split(" ");

  return (
    <>
      {words.map((word, wordIndex) => (
        <React.Fragment key={`${word}-${wordIndex}`}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => {
              // Cap the delay so long quotes and later cards remain visible.
              const delay = Math.min(characterIndex * 6, 420);
              characterIndex++;

              return (
                <span
                  key={`${wordIndex}-${charIndex}`}
                  className="scroll-reel-char"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {char}
                </span>
              );
            })}
          </span>
          {wordIndex < words.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </>
  );
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const [index, setIndex] = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const animating = React.useRef(false);
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const count = testimonials.length;

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));

    return () => {
      cancelAnimationFrame(raf);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const paginate = React.useCallback(
    (direction: 1 | -1) => {
      if (animating.current) return;

      const next = index + direction;

      if (next < 0 || next >= count) return;

      animating.current = true;

      setIndex(next);
      setExiting(true);

      timeouts.current.push(
        setTimeout(() => {
          setDisplayIndex(next);
          setExiting(false);
        }, EXIT_MS)
      );

      timeouts.current.push(
        setTimeout(() => {
          animating.current = false;
        }, SLIDE_MS)
      );
    },
    [index, count]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      paginate(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      paginate(-1);
    }
  };

  if (count === 0) return null;

  const current = testimonials[displayIndex];
  if (!current) return null;

  // The selected tile is always positioned exactly in the vertical center.
  const firstTileOffset = (REEL_HEIGHT - CELL) / 2 - 3 * (CELL + GAP);
  const middleY = firstTileOffset - index * STEP;

  // Side columns remain stationary as decorative background grids.
  const sideY = (REEL_HEIGHT - CELL) / 2;

  const columnStyle = (y: number): React.CSSProperties => ({
    transform: `translateY(${y}px)`,
    transition: mounted
      ? `transform ${SLIDE_MS}ms cubic-bezier(0.65,0,0.35,1)`
      : "none",
  });

  const sideCellCount = Math.max(6, count * 2 + 4);

  // Center column: one selected tile followed by two supporting tiles.
  const middleItems = [
    ...Array.from({ length: 3 }, (_, i) => ({
      item: testimonials[(count - 3 + i + count) % count],
      active: false,
    })),

    ...testimonials.flatMap((item, i) => [
      { item, active: true },
      {
        item: testimonials[(i + 1) % count],
        active: false,
      },
      {
        item: testimonials[(i + 2) % count],
        active: false,
      },
    ]),

    ...Array.from({ length: 3 }, (_, i) => ({
      item: testimonials[i % count],
      active: false,
    })),
  ];

  return (
    <section className="mt-12 overflow-hidden py-4 md:mt-16">
      <style>{`
        @keyframes scroll-reel-char-rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll-reel-exit {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-12px);
          }
        }

        .scroll-reel-char {
          display: inline-block;
          opacity: 0;
          animation: scroll-reel-char-rise 550ms cubic-bezier(.22,1,.36,1) forwards;
          will-change: transform, opacity;
        }

        .scroll-reel-exit {
          animation: scroll-reel-exit 220ms ease-in forwards;
        }

        .scroll-reel-exit .scroll-reel-char {
          animation: none;
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-reel-char,
          .scroll-reel-exit {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Customer testimonials"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="mx-auto flex w-full max-w-[1060px] flex-col overflow-hidden rounded-2xl border border-border bg-muted shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-[340px] md:flex-row"
      >
        {/* LEFT: Vertical initials reel */}
        <div
          aria-hidden="true"
          className="relative h-[312px] w-full shrink-0 overflow-hidden md:w-[380px]"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          {/* Important: items-start prevents flexbox from shifting the reel columns vertically. */}
          <div className="absolute inset-0 flex items-start justify-center gap-2">
            {/* Left background column */}
            <div
              className="flex shrink-0 flex-col gap-2"
              style={columnStyle(sideY)}
            >
              {Array.from({ length: sideCellCount }).map((_, i) => (
                <ReelTile
                  key={`left-${i}`}
                  name={testimonials[i % count].name}
                />
              ))}
            </div>

            {/* Center animated column */}
            <div
              className="flex shrink-0 flex-col gap-2"
              style={columnStyle(middleY)}
            >
              {middleItems.map(({ item, active }, i) => (
                <ReelTile
                  key={`${item.id}-${i}`}
                  name={item.name}
                  active={active}
                />
              ))}
            </div>

            {/* Right background column */}
            <div
              className="flex shrink-0 flex-col gap-2"
              style={columnStyle(sideY)}
            >
              {Array.from({ length: sideCellCount }).map((_, i) => (
                <ReelTile
                  key={`right-${i}`}
                  name={testimonials[(i + 2) % count].name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Testimonial content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between px-6 py-7 sm:px-8 md:py-10">
          <div className="flex flex-col gap-5">
            <Quote
              className="size-11 text-brand-red/70"
              strokeWidth={1.5}
              aria-hidden="true"
            />

            {/* Animated quote and author */}
            <div
              className="relative w-full max-w-[460px]"
              aria-live="polite"
              aria-atomic="true"
            >
              {/* Invisible content reserves enough space */}
              <div
                aria-hidden="true"
                className="invisible flex min-h-[145px] flex-col gap-5"
              >
                <p className="text-lg font-medium leading-relaxed sm:text-xl">
                  {current.quote}
                </p>

                <div>
                  <p className="text-sm font-semibold">{current.name}</p>
                  {current.company && (
                    <p className="text-xs text-muted-foreground">
                      {current.company}
                    </p>
                  )}
                </div>
              </div>

              <div
                key={displayIndex}
                className={cn(
                  "absolute inset-0 flex flex-col gap-5",
                  exiting && "scroll-reel-exit"
                )}
              >
                <p className="text-lg font-medium leading-relaxed tracking-tight text-foreground sm:text-xl">
                  “<AnimatedText text={current.quote} />”
                </p>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    <AnimatedText text={current.name} />
                  </p>

                  {current.company && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {current.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-7 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => paginate(-1)}
                disabled={index === 0}
                aria-label="Previous testimonial"
                className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-all hover:enabled:scale-110 hover:enabled:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => paginate(1)}
                disabled={index === count - 1}
                aria-label="Next testimonial"
                className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-all hover:enabled:scale-110 hover:enabled:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
