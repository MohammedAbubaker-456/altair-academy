"use client";

import { useEffect, useState } from "react";
// import { CircleChevronUp } from "lucide-react";
import { ChevronsUp } from "lucide-react";

const CIRCLE_RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function BackToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        scrollableHeight > 0 ? Math.min((scrollTop / scrollableHeight) * 100, 100) : 0;

      setScrollProgress(progress);
      setVisible(scrollTop > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const dashOffset = CIRCUMFERENCE - (scrollProgress / 100) * CIRCUMFERENCE;

  if (!visible) return null;

  return (
    <div
      //   className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1.25rem+env(safe-area-inset-right,0px))] z-40 flex h-[60px] w-[60px] items-center justify-center print:hidden"
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] right-[calc(1.25rem+env(safe-area-inset-right,0px))] z-40 flex h-[60px] w-[60px] items-center justify-center print:hidden"
    >
      {/* Progress Ring */}
      <svg
        className="absolute inset-0 -rotate-90"
        width="60"
        height="60"
        viewBox="0 0 60 60"
        aria-hidden="true"
      >
        <circle
          cx="30"
          cy="30"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-border"
        />

        <circle
          cx="30"
          cy="30"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="text-brand-red transition-[stroke-dashoffset] duration-150"
        />
      </svg>

      {/* Back to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:bg-brand-red active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
      >
        {/* ↑ */}
        {/* <CircleChevronUp size={32} strokeWidth={2.5} /> */}
        <ChevronsUp size={38} strokeWidth={2.0} />
      </button>
    </div>
  );
}
