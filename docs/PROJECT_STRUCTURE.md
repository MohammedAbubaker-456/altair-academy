# Altair Academy — Project Structure & Architecture

## Overview
Altair Academy is an accredited technical training website and administrative management portal built on Next.js 15 (App Router), TypeScript (strict mode), Tailwind CSS v4, shadcn/ui on Radix UI, MongoDB, and Prisma ORM 6.19.3.

---

## Directory Organization

```
altair-academy/
├── docker-compose.yml           # Local MongoDB single-node replica set for development
├── next.config.ts               # Next.js config (Cloudinary remotePatterns, noindex admin headers)
├── package.json                 # Dependency definitions and lifecycle scripts
├── tsconfig.json                # Strict TypeScript configuration
│
├── prisma/
│   ├── schema.prisma            # MongoDB database schema, ObjectId maps, and indexes
│   ├── seed.ts                  # Idempotent seed script (upserting initial records & admin user)
│   ├── seed-data/               # Source seed datasets
│   │   ├── categories.ts        # Technical disciplines (NDT, Corrosion, BIM, Management)
│   │   ├── courses.ts           # Accredited courses with syllabi and durations
│   │   ├── team.ts              # Unified executive leadership and instructor faculty records
│   │   ├── news.ts              # News articles (Featured hero, stories, editor picks)
│   │   └── faqs.ts              # Prospective student questions and answers
│   └── data-migrations/         # Data migration scripts run sequentially
│       └── 0001_initial_data.ts # Initial data migration payload
│
├── public/
│   └── seed/                    # Static seed images served directly from the public domain
│
├── scripts/
│   ├── create-admin.ts          # Interactive CLI script for generating new admin credentials
│   └── run-data-migrations.ts   # Runner for applying unapplied data migrations via MigrationLog
│
├── src/
│   ├── middleware.ts            # Optimistic route protection redirecting unauthenticated /admin requests
│   ├── styles.css               # Tailwind CSS v4 design system, @theme inline tokens, and fonts
│   │
│   ├── app/                     # Next.js App Router route hierarchy
│   │   ├── layout.tsx           # Global HTML shell and Google Fonts configuration
│   │   ├── page.tsx             # Public Home (Featured courses, pills, leadership, FAQs)
│   │   ├── about/page.tsx       # Public About page with management leadership team
│   │   ├── courses/             # Public Course catalog with discipline filtering
│   │   │   ├── page.tsx         # /courses catalog
│   │   │   └── [slug]/page.tsx  # Dynamic course syllabus and certification page
│   │   ├── instructors/page.tsx # Public Faculty directory with biographies and expertise tags
│   │   ├── news/page.tsx        # Public News magazine (Hero featured, stories, editor picks)
│   │   ├── search/page.tsx      # Server-side case-insensitive course search
│   │   ├── team/[slug]/page.tsx # Individual leadership member biography
│   │   ├── calendar/page.tsx    # Static course calendar
│   │   ├── careers/page.tsx     # Static instructor & career application form
│   │   ├── contact/page.tsx     # Static contact enquiry form
│   │   ├── privacy/page.tsx     # Privacy policy
│   │   ├── terms/page.tsx       # Terms of service
│   │   ├── robots.ts            # Dynamic robots.txt excluding /admin routes
│   │   │
│   │   └── admin/               # Administrative Management Portal
│   │       ├── layout.tsx       # Base admin layout with Sonner toast provider & noindex metadata
│   │       ├── login/           # Authentication portal
│   │       │   ├── page.tsx     # Sign-in page
│   │       │   ├── LoginForm.tsx# Interactive sign-in form with validation
│   │       │   └── actions.ts   # Login (bcrypt compare, timing equalization, throttling) & logout
│   │       │
│   │       ├── upload-actions.ts# Server action for Cloudinary image uploads
│   │       │
│   │       ├── categories/      # Category server actions (CRUD + delete blocking)
│   │       │   └── actions.ts
│   │       ├── courses/         # Course server actions (CRUD + image cleanup)
│   │       │   └── actions.ts
│   │       ├── team/            # Team & faculty server actions (CRUD + image cleanup)
│   │       │   └── actions.ts
│   │       ├── news/            # News post server actions (CRUD + image cleanup)
│   │       │   └── actions.ts
│   │       ├── faqs/            # FAQ server actions (CRUD)
│   │       │   └── actions.ts
│   │       │
│   │       └── (dashboard)/     # Protected Dashboard Route Group (requireAdmin enforced)
│   │           ├── layout.tsx   # Dashboard layout (Sidebar, top navigation, admin identity)
│   │           ├── page.tsx     # /admin Overview metrics (active vs inactive counts)
│   │           ├── categories/  # /admin/categories management dialogs & table
│   │           ├── courses/     # /admin/courses list, /new, and /[id] forms
│   │           ├── team/        # /admin/team list, /new, and /[id] forms
│   │           ├── news/        # /admin/news list, /new, and /[id] forms
│   │           ├── faqs/        # /admin/faqs list & modal dialogs
│   │           └── settings/    # /admin/settings change-password form
│   │
│   ├── components/
│   │   ├── admin/               # Dedicated admin UI components
│   │   │   ├── AdminHeader.tsx  # Top bar with profile display, logout, and mobile trigger
│   │   │   ├── AdminSidebar.tsx # Sidebar navigation and active route styling
│   │   │   ├── DeleteDialog.tsx # Accessible confirmation modal for destructive operations
│   │   │   ├── ImageUpload.tsx  # Cloudinary file uploader, preview, and URL fallback
│   │   │   └── StatusSwitch.tsx # Optimistic toggle switch for ACTIVE/INACTIVE statuses
│   │   ├── site/                # Public website components (CourseCard, Header, Footer, etc.)
│   │   └── ui/                  # Reusable shadcn/ui components (Radix primitives)
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── session.ts       # Jose HS256 JWT cookie session management & requireAdmin()
│   │   │   └── throttle.ts      # Login attempt rate-limiter (5 attempts / 15 min per IP+email)
│   │   ├── validation/          # Shared Zod validation schemas
│   │   │   ├── auth.ts          # Login and password change schemas
│   │   │   ├── category.ts      # Category input constraints
│   │   │   ├── course.ts        # Course input constraints
│   │   │   ├── team.ts          # Team & faculty constraints
│   │   │   ├── news.ts          # News post constraints
│   │   │   └── faq.ts           # FAQ constraints
│   │   ├── db.ts                # Server-only Prisma client singleton with dev global cache
│   │   ├── env.ts               # Server-only Zod validation of environment variables
│   │   ├── format.ts            # Date formatting utilities (UTC en-GB)
│   │   ├── id.ts                # MongoDB ObjectId validator regex
│   │   ├── slugify.ts           # URL-friendly slug generator
│   │   ├── storage.ts           # Server-only Cloudinary upload and deletion service
│   │   └── utils.ts             # Tailwind class merging (clsx + twMerge)
│   │
│   └── server/
│       ├── revalidate.ts        # On-demand cache revalidation helper
│       ├── queries/             # Public queries (always enforce status: ACTIVE)
│       │   ├── categories.ts
│       │   ├── courses.ts
│       │   ├── team.ts
│       │   ├── news.ts
│       │   └── faqs.ts
│       └── admin/               # Admin queries (requireAdmin protected)
│           ├── stats.ts
│           ├── categories.ts
│           ├── courses.ts
│           ├── team.ts
│           ├── news.ts
│           └── faqs.ts
```

---

## Database Models & Relationships

| Model | Collection | Primary Identifiers & Relations | Notes |
|---|---|---|---|
| `AdminUser` | `AdminUser` | `id @id @default(auto()) @map("_id") @db.ObjectId`, `email @unique` | Passwords hashed with bcrypt cost 12. |
| `LoginAttempt` | `LoginAttempt` | `key @unique` (email + client IP) | Tracks failed logins for automatic 15-minute lockout. |
| `MigrationLog` | `MigrationLog` | `name @unique` | Tracks applied data migrations in sequential order. |
| `Category` | `Category` | `slug @unique`, relation `courses Course[]` | Technical course discipline with display ordering. |
| `Course` | `Course` | `slug @unique`, `categoryId @db.ObjectId` | Relation to `Category` with `onDelete: Restrict`. Index on `[status, order]`. |
| `TeamMember` | `TeamMember` | `slug @unique`, `placements TeamPlacement[]` | Unified leadership & faculty record. |
| `NewsPost` | `NewsPost` | `slug @unique`, `kind NewsKind` | Index on `[status, kind, publishedAt]`. |
| `Faq` | `Faq` | `id @id @default(auto()) @map("_id") @db.ObjectId` | Ordered student questions and answers. |

---

## Architectural Principles
1. **Server Components by Default**: Pages, queries, layouts, and server actions run strictly on the Node.js runtime. Client Components (`"use client"`) are restricted to interactive leaf elements (switches, dialogs, forms, uploaders).
2. **Strict TypeScript & Index Access**: Configured with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noPropertyAccessFromIndexSignature`. All index lookups use bracket notation (`searchParams["q"]`, `process.env["DATABASE_URL"]`).
3. **Defense-in-Depth Security**: Real authentication is enforced by `requireAdmin()` on the server side in the layout, within every query in `src/server/admin/`, and at the top of every Server Action. Edge middleware provides optimistic navigation redirection.
4. **On-Demand Cache Revalidation**: Mutations in the dashboard invoke `revalidatePublicData()`, triggering `revalidatePath("/", "layout")` to ensure public pages immediately reflect database changes.
