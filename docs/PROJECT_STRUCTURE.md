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
│   │   ├── layout.tsx               # Global HTML shell and Google Fonts configuration
│   │   ├── page.tsx                 # Public Home (Featured courses, pills, leadership, FAQs)
│   │   ├── about/page.tsx           # Public About page with management leadership team
│   │   ├── courses/                 # Public Course catalog with discipline filtering
│   │   │   ├── page.tsx             # /courses catalog
│   │   │   └── [slug]/page.tsx      # Dynamic course syllabus and certification page
│   │   ├── instructors/page.tsx     # Public Faculty directory with biographies and expertise tags
│   │   ├── news/page.tsx            # Public News magazine (Hero featured, stories, editor picks)
│   │   ├── search/page.tsx          # Server-side case-insensitive course search
│   │   ├── team/[slug]/page.tsx     # Individual leadership member biography
│   │   ├── calendar/page.tsx        # Static course calendar
│   │   ├── careers/page.tsx         # Static instructor & career application form
│   │   ├── contact/page.tsx         # Static contact enquiry form
│   │   ├── privacy/page.tsx         # Privacy policy
│   │   ├── terms/page.tsx           # Terms of service
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
│   │       ├── news/actions.ts      # News post server actions (CRUD + image cleanup)
│   │       ├── faqs/actions.ts      # FAQ server actions (CRUD)
│   │       │
│   │       └── (dashboard)/         # Protected Dashboard Route Group (requireAdmin enforced)
│   │           ├── layout.tsx       # Dashboard layout (Sidebar, top navigation, admin identity)
│   │           ├── page.tsx         # /admin Overview metrics (active vs inactive counts)
│   │           ├── categories/      # /admin/categories management dialogs & table
│   │           ├── courses/         # /admin/courses list, /new, and /[id] forms
│   │           ├── team/            # /admin/team list, /new, and /[id] forms
│   │           ├── news/            # /admin/news list, /new, and /[id] forms
│   │           ├── faqs/            # /admin/faqs list & modal dialogs
│   │           └── settings/        # /admin/settings change-password form
│   │
│   ├── components/
│   │   ├── admin/                   # Dedicated admin UI components
│   │   │   ├── AdminHeader.tsx      # Top bar with profile display, logout, and mobile trigger
│   │   │   ├── AdminSidebar.tsx     # Sidebar navigation and active route styling
│   │   │   ├── DeleteDialog.tsx     # Accessible confirmation modal for destructive operations
│   │   │   ├── ImageUpload.tsx      # File uploader, preview, replace, and remove (no URL pasting)
│   │   │   └── StatusSwitch.tsx     # Optimistic toggle switch for ACTIVE/INACTIVE statuses
│   │   ├── site/                    # Public website components (CourseCard, Header, Footer, etc.)
│   │   └── ui/                      # Reusable shadcn/ui components (Radix primitives)
│   │
│   ├── lib/
│   │   ├── env.ts                   # Runtime environment validation (Zod, UPLOAD_DIR isolation rules)
│   │   ├── db.ts                    # Global cached PrismaClient singleton
│   │   ├── storage.ts               # Local disk persistent storage driver (magic bytes, UUID filenames)
│   │   ├── auth/
│   │   │   ├── session.ts           # Jose HS256 JWT cookie session management & requireAdmin()
│   │   │   └── password.ts          # Bcrypt password hashing (cost factor 12) & timing equalization
│   │   └── validation/              # Shared Zod validation schemas enforcing /uploads/ or /seed/ paths
│   │       ├── course.ts
│   │       ├── team.ts
│   │       └── news.ts
│   │
│   └── server/
│       └── queries/                 # Public read-only queries strictly enforcing status: "ACTIVE"
│           ├── courses.ts
│           ├── categories.ts
│           ├── team.ts
│           ├── news.ts
│           └── faqs.ts
```
