/**
 * Public Header Client Component
 *
 * Client Component managing navigation state, dropdown flyouts, search modal,
 * and mobile navigation bar. Receives dynamic menu tree from the Server Header component.
 *
 * Location: src/components/site/HeaderClient.tsx
 * Type: Client Component ("use client")
 */

"use client";

import { useEffect, useRef, useState, type ComponentProps, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeaderMenuItem } from "@/server/queries/menu";
import logo from "@/assets/altair-academy-logo.png";

const navLinkClass =
  "text-lg font-medium text-primary/80 transition-colors hover:text-brand-red data-[status=active]:text-brand-red";

function NavLink({
  href,
  exact = false,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { exact?: boolean }) {
  const pathname = usePathname();

  const hrefString = typeof href === "string" ? href : (href.pathname ?? "");

  const active = exact
    ? pathname === hrefString
    : pathname === hrefString || pathname.startsWith(hrefString + "/");

  return (
    <Link
      href={href}
      className={className}
      data-status={active ? "active" : undefined}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}

interface HeaderClientProps {
  menu: HeaderMenuItem[];
}

export function HeaderClient({ menu }: HeaderClientProps) {
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Courses dropdown outside click and Escape
  useEffect(() => {
    if (!coursesOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCoursesOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCoursesOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [coursesOpen]);

  // Search popup focus, outside click, and Escape
  useEffect(() => {
    if (!searchOpen) return;

    searchRef.current?.focus();

    const onPointerDown = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [searchOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      searchRef.current?.focus();
      return;
    }

    setSearchOpen(false);

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <header className="relative z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-around gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src={logo}
            alt="Altair Academy"
            width={222}
            height={70}
            priority
            className="h-[70px] w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          <NavLink href="/" exact className={navLinkClass}>
            Home
          </NavLink>

          <NavLink href="/about" className={navLinkClass}>
            About Us
          </NavLink>

          {/* Courses Dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => setCoursesOpen(false)}
          >
            <span className="flex items-center gap-1">
              <NavLink
                href="/courses"
                onClick={() => setCoursesOpen(false)}
                className="py-6 text-lg font-medium text-primary/80 transition-colors hover:text-brand-red data-[status=active]:text-brand-red"
              >
                Our Courses
              </NavLink>

              <button
                type="button"
                onClick={() => setCoursesOpen((open) => !open)}
                aria-expanded={coursesOpen}
                aria-haspopup="true"
                aria-label="Toggle courses menu"
                className="cursor-pointer p-1 text-primary/80 transition-colors hover:text-brand-red"
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    coursesOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
            </span>

            {coursesOpen ? (
              <div className="absolute left-0 top-full z-50 w-[320px] shadow-2xl">
                <MenuList items={menu} onNavigate={() => setCoursesOpen(false)} />
              </div>
            ) : null}
          </div>

          <NavLink href="/instructors" className={navLinkClass}>
            Instructors
          </NavLink>

          <NavLink href="/careers" className={navLinkClass}>
            Careers
          </NavLink>

          <NavLink href="/news" className={navLinkClass}>
            News
          </NavLink>
        </nav>

        {/* Header Actions */}
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          {/* Search Container */}
          <div className="relative shrink-0">
            {/* Search Icon */}
            <button
              type="button"
              aria-label="Search courses"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="relative z-10 cursor-pointer rounded-md p-2 text-primary/70 transition-colors hover:bg-secondary hover:text-brand-red"
            >
              <Search className="size-[18px]" />
            </button>

            {/* Search Popup */}
            {searchOpen && (
              <div className="absolute right-0 top-full z-[9999] mt-3 w-max">
                <form
                  onSubmit={submitSearch}
                  role="search"
                  className="flex items-center gap-2 rounded-lg border border-border bg-background p-2 shadow-xl"
                >
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search courses..."
                    aria-label="Search courses"
                    className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary sm:w-56"
                  />

                  {/* Submit Search */}
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="cursor-pointer rounded-md p-2 text-primary/70 hover:bg-secondary hover:text-brand-red"
                  >
                    <Search className="size-4" />
                  </button>

                  {/* Close Search */}
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => setSearchOpen(false)}
                    className="cursor-pointer rounded-md p-2 text-primary/70 hover:bg-secondary hover:text-brand-red"
                  >
                    <X className="size-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Contact Us */}
          <Button variant="cta" size="default" className="hidden text-base sm:inline-flex" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>

          {/* Mobile Menu */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="cursor-pointer rounded-md p-2 text-primary lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen ? (
        <nav
          className="border-t border-border bg-background px-4 py-4 lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About Us" },
              { href: "/courses", label: "Our Courses" },
              { href: "/instructors", label: "Instructors" },
              { href: "/careers", label: "Careers" },
              { href: "/news", label: "News" },
              { href: "/contact", label: "Contact Us" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-lg font-medium text-primary/80 hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function MenuList({
  items,
  onNavigate,
  depth = 0,
}: {
  items: HeaderMenuItem[];
  onNavigate: () => void;
  depth?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul
      className="w-[320px] border border-white/20 bg-primary"
      onMouseLeave={() => setOpenIndex(null)}
    >
      {items.map((item, index) => {
        const active = openIndex === index;

        return (
          <li key={item.name} className="relative border-b border-white/70 last:border-b-0">
            <Link
              href={item.href}
              onClick={onNavigate}
              onMouseEnter={() => setOpenIndex(index)}
              className={cn(
                "flex items-center justify-between gap-3 px-6 py-4 text-base text-primary-foreground transition-colors",
                active ? "bg-brand-red" : "hover:bg-brand-red",
              )}
            >
              <span>{item.name}</span>

              {item.children ? (
                <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
              ) : null}
            </Link>

            {item.children && active ? (
              <div className="absolute left-full top-0 z-50">
                <MenuList items={item.children} onNavigate={onNavigate} depth={depth + 1} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
