# Altair Academy — Project Structure & Architecture

## Overview

Altair Academy is an accredited technical training website and administrative management portal built on Next.js 15 (App Router, standalone output), TypeScript (strict mode), Tailwind CSS v4, shadcn/ui on Radix UI, MongoDB, and Prisma ORM 6.19.3. Configured for production deployment on GoDaddy "Web Hosting Deluxe" (cPanel with Phusion Passenger) and MongoDB Atlas.

---

## Directory Organization

```
altair-academy/
├── .github/
│   └── workflows/
│       └── build-cpanel.yml         # GitHub Actions workflow building Linux package on Ubuntu 22
│
├── deploy/                          # Production package artifacts (gitignored)
│   ├── cpanel-package/              # Staged standalone distribution for cPanel
│   ├── altair-academy-cpanel.zip    # Compressed archive for cPanel File Manager upload
│   └── altair-academy-cpanel.tar.gz # Tarball archive for SSH extraction
│
├── docs/
│   ├── DEPLOYMENT_GODADDY_DELUXE.md # Complete GoDaddy Deluxe & cPanel Node.js 22 deployment guide
│   ├── LOCAL_MONGODB_SETUP.md       # Native local MongoDB replica set setup guide (no Docker)
│   ├── BACKEND_AND_ADMIN.md         # Backend architecture, security, and admin manual
│   └── PROJECT_STRUCTURE.md         # Architecture and directory reference
│
├── next.config.ts                   # Standalone output, localPatterns for /uploads/**, cache headers
├── package.json                     # Dependency definitions and lifecycle scripts
├── tsconfig.json                    # Strict TypeScript configuration
│
├── prisma/
│   ├── schema.prisma                # MongoDB schema, binaryTargets ["native", "rhel-openssl-3.0.x"]
│   ├── seed.ts                      # Idempotent seed script (upserting initial records & admin user)
│   ├── seed-data/                   # Source seed datasets (categories, courses, team, news, faqs)
│   └── data-migrations/             # Programmatic data migrations run sequentially
│
├── public/
│   └── seed/                        # Static seed images shipped inside every build
│
├── scripts/
│   ├── check-db.ts                  # Local database connectivity and replica set probe (npm run db:check)
│   ├── package-cpanel.mjs           # Standalone packaging script (npm run package:cpanel)
│   ├── create-admin.ts              # Interactive CLI script for generating new admin credentials
│   └── run-data-migrations.ts       # Runner for applying unapplied data migrations via MigrationLog
│
├── tools/                           # Standalone diagnostic tools for cPanel SSH (no tsx / no CLI dependencies)
│   ├── connectivity-check.mjs       # Raw DNS SRV resolution and TCP socket probe to Atlas on port 27017
│   └── check-db.mjs                 # Runtime Prisma client probe executing raw MongoDB `hello` command
│
├── uploads/                         # Development persistent media storage (outside src/)
│   └── .gitkeep
│
├── src/
│   ├── middleware.ts                # Route protection redirecting unauthenticated /admin requests
│   ├── styles.css                   # Tailwind CSS v4 design system, @theme inline tokens, and fonts
│   │
│   ├── app/                         # Next.js App Router route hierarchy
│   │   ├── layout.tsx               # Global HTML shell, metadataBase (SITE_URL), Google Fonts
│   │   ├── page.tsx                 # Public Home (Featured courses, pills, leadership, FAQs, dynamic contact)
│   │   ├── about/page.tsx           # Public About page with management leadership team
│   │   ├── courses/                 # Public Course catalog with discipline filtering
│   │   │   ├── page.tsx             # /courses catalog
│   │   │   └── [slug]/page.tsx      # Dynamic course syllabus and certification page
│   │   ├── instructors/page.tsx     # Public Faculty directory with biographies and expertise tags
│   │   ├── news/                    # Public News magazine & dynamic articles
│   │   │   ├── page.tsx             # /news magazine (Hero featured, stories, editor picks with slug links)
│   │   │   └── [slug]/page.tsx      # /news/[slug] article detail page with Markdown body, hero, & latest stories
│   │   ├── search/page.tsx          # Server-side case-insensitive course search
│   │   ├── team/[slug]/page.tsx     # Individual leadership member biography
│   │   ├── calendar/page.tsx        # Dynamic contact-backed course calendar (Server Component + CalendarViewer)
│   │   ├── careers/page.tsx         # Dynamic "Currently Open Positions" from DB (Server Component + CareersForm)
│   │   ├── contact/page.tsx         # Dynamic contact channels & enquiry form from DB
│   │   ├── privacy/page.tsx         # DB-backed Privacy Policy with Markdown & dynamic token replacement
│   │   ├── terms/page.tsx           # DB-backed Terms of Service with Markdown & dynamic token replacement
│   │   ├── legal/                   # Custom policy & compliance routes
│   │   │   └── [slug]/page.tsx      # Dynamic legal page with 308 permanent redirects for /privacy & /terms
│   │   ├── robots.ts                # Dynamic robots.txt excluding /admin routes
│   │   │
│   │   ├── api/
│   │   │   └── health/route.ts      # GET /api/health trivial database ping (returns { ok: true } or 503)
│   │   │
│   │   ├── uploads/
│   │   │   └── [...path]/route.ts   # Secure static serving route handler with traversal rejection & cache
│   │   │
│   │   └── admin/                   # Administrative Management Portal
│   │       ├── layout.tsx           # Base admin layout with Sonner toast provider & noindex metadata
│   │       ├── upload-actions.ts    # Server action for local disk image uploads
│   │       ├── login/               # Authentication portal (rate-limited, timing equalization)
│   │       ├── categories/actions.ts# Category server actions (CRUD + delete blocking)
│   │       ├── courses/actions.ts   # Course server actions (CRUD + image cleanup)
│   │       ├── team/actions.ts      # Team & faculty server actions (CRUD + image cleanup)
│   │       ├── news/actions.ts      # News post server actions (CRUD + body persistence + image cleanup)
│   │       ├── faqs/actions.ts      # FAQ server actions (CRUD)
│   │       ├── careers/actions.ts   # Careers server actions (CRUD + status toggle + revalidation)
│   │       ├── contact/actions.ts   # Contact details server actions (CRUD + status toggle + layout revalidation)
│   │       ├── legal/actions.ts     # Legal pages server actions (CRUD + core protection + layout revalidation)
│   │       │
│   │       └── (dashboard)/         # Protected Dashboard Route Group (requireAdmin enforced)
│   │           ├── layout.tsx       # Dashboard layout (Sidebar, top navigation, admin identity)
│   │           ├── page.tsx         # /admin Overview metrics (active vs inactive counts for all entities)
│   │           ├── categories/      # /admin/categories management dialogs & table
│   │           ├── courses/         # /admin/courses list, /new, and /[id] forms
│   │           ├── team/            # /admin/team list, /new, and /[id] forms
│   │           ├── news/            # /admin/news list, /new, and /[id] forms (Markdown body & live preview)
│   │           ├── faqs/            # /admin/faqs list & modal dialogs
│   │           ├── careers/         # /admin/careers table, /new, and /[id] forms
│   │           ├── contact/         # /admin/contact grouped channels table, adaptive dialog, & footer preview
│   │           ├── legal/           # /admin/legal table, /new, and /[id] forms (core protected)
│   │           └── settings/        # /admin/settings change-password form
│   │
│   ├── components/
│   │   ├── admin/                   # Dedicated admin UI components
│   │   │   ├── AdminHeader.tsx      # Top bar with profile display, logout, and mobile trigger
│   │   │   ├── AdminSidebar.tsx     # Sidebar with Content & Site Settings groups
│   │   │   ├── DeleteDialog.tsx     # Accessible confirmation modal for destructive operations
│   │   │   ├── ImageUpload.tsx      # File uploader, preview, replace, and remove (no URL pasting)
│   │   │   └── StatusSwitch.tsx     # Optimistic toggle switch for ACTIVE/INACTIVE statuses
│   │   ├── site/                    # Public website components
│   │   │   ├── Header.tsx           # Main navigation header
│   │   │   ├── Footer.tsx           # Async Server Component querying dynamic contact & legal links
│   │   │   ├── MarkdownContent.tsx  # Safe Markdown renderer & admin MarkdownPreview (react-markdown)
│   │   │   ├── NewsStoryCard.tsx    # Reusable news card linking to /news/[slug]
│   │   │   ├── CareersContent.tsx   # Server Component rendering dynamic openings
│   │   │   ├── CareersForm.tsx      # Client Component handling resume submission
│   │   │   ├── CalendarContent.tsx  # Server Component with dynamic contact
│   │   │   └── CalendarViewer.tsx   # Client Component for month navigation & modal schedule
│   │   └── ui/                      # Reusable shadcn/ui components (Radix primitives)
│   │
│   ├── lib/
│   │   ├── env.ts                   # Runtime environment validation (Zod, optional SITE_URL, UPLOAD_DIR)
│   │   ├── db.ts                    # Global cached PrismaClient singleton
│   │   ├── safe-url.ts              # URL scheme allow-lists, phone, WhatsApp, and slug validation
│   │   ├── careers.ts               # Employment type labels and formatters
│   │   ├── legal.ts                 # Canonical legal URL resolution (legalHref)
│   │   ├── storage.ts               # Local disk persistent storage driver (magic bytes, UUID filenames)
│   │   ├── auth/
│   │   │   ├── session.ts           # Jose HS256 JWT cookie session management & requireAdmin()
│   │   │   └── password.ts          # Bcrypt password hashing (cost factor 12) & timing equalization
│   │   └── validation/              # Shared Zod validation schemas
│   │       ├── course.ts
│   │       ├── team.ts
│   │       ├── news.ts              # News schema with optional body (Markdown <= 50,000)
│   │       ├── careers.ts           # JobOpening validation schema
│   │       ├── contact.ts           # ContactDetail schema with per-type refinements
│   │       └── legal.ts             # LegalPage validation schema with reserved slug guards
│   │
│   └── server/
│       ├── admin/                   # Administrative data queries (requireAdmin enforced)
│       │   ├── stats.ts             # Dashboard overview stats across all models
│       │   ├── courses.ts
│       │   ├── categories.ts
│       │   ├── team.ts
│       │   ├── news.ts
│       │   ├── careers.ts           # Careers admin search, pagination & ID query
│       │   ├── contact.ts           # Contact channels grouped & per-type counts
│       │   └── legal.ts             # Legal pages query & ID lookup
│       │
│       ├── queries/                 # Public read-only queries strictly enforcing status: "ACTIVE"
│       │   ├── courses.ts
│       │   ├── categories.ts
│       │   ├── team.ts
│       │   ├── news.ts              # News queries + getNewsPostBySlug & getLatestNewsExcluding
│       │   ├── faqs.ts
│       │   ├── careers.ts           # getActiveJobOpenings (ordered)
│       │   ├── contact.ts           # getContactDetails (grouped) & getContactInfo (legacy adapter)
│       │   └── legal.ts             # getFooterLegalLinks, getActiveLegalPageBySlug, replaceLegalTokens
│       │
│       └── revalidate.ts            # Next.js on-demand cache revalidation (revalidatePath("/", "layout"))
```
