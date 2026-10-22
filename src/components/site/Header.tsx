import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courseMenu, type CourseMenuItem } from "@/data/site";
import logo from "@/assets/altair-academy-logo.png";

const navLinkClass =
  "text-lg font-medium text-primary/80 transition-colors hover:text-brand-red data-[status=active]:text-brand-red";

export function Header() {
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!coursesOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCoursesOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCoursesOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [coursesOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchOpen(false);
    navigate({ to: "/search", search: { q: query } });
  };

  return (
    <header className="relative z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="Altair Academy" width={222} height={70} className="h-[70px] w-auto" />
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Main">
          <Link to="/" className={navLinkClass} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/about" className={navLinkClass}>
            About Us
          </Link>

          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => setCoursesOpen(false)}
          >
            <span className="flex items-center gap-1">
              <Link
                to="/courses"
                search={{}}
                onClick={() => setCoursesOpen(false)}
                className="py-6 text-lg font-medium text-primary/80 transition-colors hover:text-brand-red data-[status=active]:text-brand-red"
              >
                Our Courses
              </Link>
              <button
                type="button"
                onClick={() => setCoursesOpen((open) => !open)}
                aria-expanded={coursesOpen}
                aria-haspopup="true"
                aria-label="Toggle courses menu"
                className="cursor-pointer p-1 text-primary/80 transition-colors hover:text-brand-red"
              >
                <ChevronDown
                  className={cn("size-4 transition-transform duration-200", coursesOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </span>
            {coursesOpen ? (
              <div className="absolute left-0 top-full z-50 w-[320px] shadow-2xl">
                <MenuList items={courseMenu} onNavigate={() => setCoursesOpen(false)} />
              </div>
            ) : null}
          </div>


          <Link to="/instructors" className={navLinkClass}>
            Instructors
          </Link>
          <Link to="/careers" className={navLinkClass}>
            Careers
          </Link>
          <Link to="/news" className={navLinkClass}>
            News
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center gap-1" role="search">
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses…"
                aria-label="Search courses"
                className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary sm:w-56"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="cursor-pointer p-2 text-primary/70 hover:text-brand-red"
              >
                <X className="size-4" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              aria-label="Search courses"
              onClick={() => setSearchOpen(true)}
              className="cursor-pointer rounded-md p-2 text-primary/70 transition-colors hover:bg-secondary hover:text-brand-red"
            >
              <Search className="size-[18px]" />
            </button>
          )}

          <Button variant="cta" size="default" className="hidden text-base sm:inline-flex" asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>

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

      {mobileOpen ? (
        <nav className="border-t border-border bg-background px-4 py-4 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/courses", label: "Our Courses" },
              { to: "/instructors", label: "Instructors" },
              { to: "/careers", label: "Careers" },
              { to: "/news", label: "News" },
              { to: "/contact", label: "Contact Us" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
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
  items: CourseMenuItem[];
  onNavigate: () => void;
  depth?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul className="w-[320px] border border-white/20 bg-primary" onMouseLeave={() => setOpenIndex(null)}>
      {items.map((item, index) => {
        const active = openIndex === index;
        return (
          <li key={item.name} className="relative border-b border-white/70 last:border-b-0">
            <Link
              to="/courses"
              search={{ category: item.category }}
              onClick={onNavigate}
              onMouseEnter={() => setOpenIndex(index)}
              className={cn(
                "flex items-center justify-between gap-3 px-6 py-4 text-base text-primary-foreground transition-colors",
                active ? "bg-brand-red" : "hover:bg-brand-red",
              )}
            >
              <span>{item.name}</span>
              {item.children ? <ChevronRight className="size-4 shrink-0" aria-hidden="true" /> : null}
            </Link>
            {item.children && active ? (
              <div className="absolute left-full top-0 z-50" style={{ marginTop: 0 }}>
                <MenuList items={item.children} onNavigate={onNavigate} depth={depth + 1} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
