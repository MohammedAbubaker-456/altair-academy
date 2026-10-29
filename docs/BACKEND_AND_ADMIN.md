# Altair Academy — Backend & Admin Dashboard Guide

This document describes the backend architecture, MongoDB + Prisma setup, authentication, administration portal, local-disk media storage, and deployment guidelines for Altair Academy.

---

## 1. Prerequisites & Environment Setup

### Required Services

1. **MongoDB (Replica Set required)**: Prisma requires a MongoDB replica set to support multi-document transactions.
   - **Local Development**: Native local MongoDB running as a single-node replica set (`rs0`). No Docker. Follow the comprehensive setup guide:
     👉 **[docs/LOCAL_MONGODB_SETUP.md](LOCAL_MONGODB_SETUP.md)**
   - **Production (GoDaddy Web Hosting Deluxe / cPanel)**: MongoDB Atlas (Europe region nearest hosting data center). Shared cPanel servers cannot run MongoDB services. See the complete deployment guide:
     👉 **[docs/DEPLOYMENT_GODADDY_DELUXE.md](DEPLOYMENT_GODADDY_DELUXE.md)**
2. **Node.js**: v20.9.0 or higher (v22 recommended).

### Environment Configuration (.env)

Create a `.env` file at the root of the project (modeled after `.env.example`):

```bash
# ==============================================================================
# DEVELOPMENT CONFIGURATION (Local Native MongoDB Replica Set)
# ==============================================================================
DATABASE_URL="mongodb://127.0.0.1:27017/altair-academy?replicaSet=rs0"
AUTH_SECRET="development-auth-secret-minimum-32-characters-for-jwt-signing"

# Optional: Public site canonical origin (recommended for canonical URLs & OG metadata)
# SITE_URL="http://localhost:3000"

# Optional in development (defaults to <project>/uploads outside src)
# UPLOAD_DIR="./uploads"

# Optional in development (defaults to <project>/private-uploads outside src and gitignored)
# PRIVATE_UPLOAD_DIR="./private-uploads"

# Seed Admin Credentials (Minimum 12 characters password required)
ADMIN_EMAIL="admin@altairacademy.com"
ADMIN_PASSWORD="ChangeMeInProduction123!"

# ==============================================================================
# PRODUCTION CONFIGURATION (GoDaddy cPanel / Setup Node.js App)
# ==============================================================================
# DATABASE_URL="mongodb+srv://<user>:<url-encoded-password>@<cluster>.mongodb.net/altair-academy?retryWrites=true&w=majority"
# AUTH_SECRET="generate-a-secure-random-64-character-string-via-openssl"
# UPLOAD_DIR="/home/<cpanel-user>/altair-assets/uploads"
# PRIVATE_UPLOAD_DIR="/home/<cpanel-user>/altair-assets/private-uploads"
# SITE_URL="https://altairacademy.com"
```

> [!IMPORTANT]
> **Database Synchronization Note**:
> When pulling these updates to an existing repository, you **MUST** run:
>
> ```bash
> npm run db:push
> npm run db:seed
> ```
>
> - `db:push` syncs the MongoDB collections (`Lead`, `CareerApplication`, `NewsletterSubscriber`, `CalendarCourse`, `CalendarSession`, and `Subcategory`), establishes indexes (`@@index([status, createdAt])`, `@@index([status, subscribedAt])`, `@@index([status, startDate])`, `@@index([courseId])`, `@@index([subcategoryId])`, unique index on course code, composite unique index on `[courseId, kind, startDate, endDate]`, composite unique index on `[categoryId, slug]`, and `@@index([categoryId, parentId, order])`).
> - `db:seed` performs safe, insert-only population: provisions subcategories under matching categories (e.g., NDT -> ASNT Courses, PCN Courses, Special NDT; Office Productivity -> Beginner, Intermediate), calendar courses, and sessions without overwriting any existing administrator customizations.

---

## 2. CLI Commands Reference

| Command                   | Purpose                                                                     | When to Run                                                       |
| ------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`             | Starts Next.js development server                                           | Standard local development                                        |
| `npm run dev:clean`       | Removes `.next` build cache and starts clean dev server                     | After pulling branch updates or an interrupted dev session        |
| `npm run build`           | Compiles Next.js standalone application                                     | Testing production build locally                                  |
| `npm run db:check`        | Verifies MongoDB connection & writable replica set                          | After starting local MongoDB or testing Atlas                     |
| `npm run db:generate`     | Generates Prisma Client for native & Linux targets                          | After modifying `prisma/schema.prisma`                            |
| `npm run db:push`         | Synchronizes Prisma schema with MongoDB                                     | Schema updates (local or Atlas from local PC)                     |
| `npm run db:seed`         | Seeds categories, courses, team, news, FAQs, careers, contact, legal, admin | Initial database setup & feature migrations                       |
| `npm run db:data-migrate` | Runs sequential data migrations from `prisma/data-migrations/`              | Schema evolution and transformations                              |
| `npm run admin:create`    | Interactive CLI to provision additional admins                              | Account provisioning                                              |
| `npm run package:cpanel`  | Prepares standalone cPanel Linux deployment package                         | Preparing production release (`deploy/altair-academy-cpanel.zip`) |
| `npm run lint`            | ESLint + Prettier code analysis                                             | Code quality check                                                |

> [!IMPORTANT]
>
> ### Local Development Hygiene & Server Actions
>
> 1. **Run a Single Dev Server**: Always ensure only **one** `next dev` process is running at any time. Competing dev servers listening on different ports cause cookie isolation issues and stale action ID mismatches.
> 2. **Use `http://localhost:3000`**: Always access the admin panel via `http://localhost:3000`. Next.js 15 Server Actions enforce Origin vs. Host security checks. Using IP addresses (e.g. `192.168.x.x:3000`) will be rejected unless explicitly whitelisted in `next.config.ts`.
> 3. **When to run `npm run dev:clean`**:
>    - After checking out a different Git branch or pulling major updates.
>    - Following any interrupted implementation session where dev server was stopped during compilation.
>    - If the browser console displays `"Failed to find Server Action"` (HTTP 404). This indicates the browser loaded a client JS bundle with stale action hash IDs that no longer match the server's build manifest.
> 4. **Session Re-authentication**: Whenever `AUTH_SECRET` is changed in `.env` or the database is reseeded, always log out and sign in again at `http://localhost:3000/admin/login` to obtain a fresh JWT session token.

---

## 3. Database Sync & Seed Safety

MongoDB does not support traditional SQL migration files. Prisma uses schema synchronization via `db push`.

### Step 1: Check Database Health

```bash
npm run db:check
```

### Step 2: Push Schema to MongoDB

Pushes collections, indexes, and constraints to your MongoDB database:

```bash
npm run db:push
```

### Step 3: Seed Initial Data & First Administrator

Populates categories, courses, team members, news posts, FAQs, job openings, contact channels, legal pages, and creates the first admin user:

```bash
npm run db:seed
```

> [!TIP]
> **Strict Insert-Only Seed Safety**:
> All seed operations across all models are strictly **insert-only** (`create` only if matching slug/title/type does not exist).
>
> - Seeding **NEVER** overwrites, resets, or reverts edits made by administrators through the admin portal.
> - If an administrator with `ADMIN_EMAIL` already exists, the seed script skips creation and **never resets the administrator's password**.
> - Seed script requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` (minimum 12 characters) in `.env` and rejects execution with clear feedback if credentials are missing.

---

## 4. Administrator Account Management

### Initial Admin

The first administrator is provisioned during `npm run db:seed` using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` defined in `.env`.

### Creating Additional Administrators

To provision additional administrators interactively via CLI without exposing credentials in environment files:

```bash
npm run admin:create
```

Follow the interactive prompts to enter the admin name, email, and password. The password will be hashed using bcrypt (cost factor 12).

### Changing Admin Passwords

Logged-in administrators can change their password at any time via the admin dashboard:

- Navigate to `/admin/settings`
- Enter Current Password
- Enter and Confirm New Password (minimum 8 characters)

---

## 5. Data Migrations

Because MongoDB does not use SQL migration files, schema evolutions and data transformations are handled via programmatic data migrations:

- **Location**: `prisma/data-migrations/` (e.g. `0001_initial_data.ts`, `0002_add_field.ts`).
- **Tracking**: Applied migrations are recorded in the `MigrationLog` MongoDB collection.
- **Runner**: Execute unapplied data migrations in sequential order:
  ```bash
  npm run db:data-migrate
  ```

---

## 6. Admin Dashboard Navigation & Features

Access the dashboard at `/admin`. If not authenticated, you will be redirected to `/admin/login`.

| Route                          | Purpose                    | Key Features                                                                                                                                                                  |
| ------------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`                       | System Overview            | Counts of active vs inactive entities across all collections, new leads & applications summary, database status.                                                              |
| `/admin/leads`                 | Contact Leads Inbox        | Search (?q= over name/email/phone/message), status filter (NEW / CONTACTED / CLOSED), pagination, UTC date with explicit MYT (Asia/Kuala_Lumpur) display.                     |
| `/admin/leads/[id]`            | Lead Detail Viewer         | Inspect candidate enquiry, status transition select, direct mailto and tel actions, message rendering with whitespace preservation, delete confirmation.                      |
| `/admin/applications`          | Careers Applications Inbox | Search candidate name/email/phone/specialisation, status filter (NEW / REVIEWING / SHORTLISTED / REJECTED), attachment badges, pagination.                                    |
| `/admin/applications/[id]`     | Application Detail Viewer  | Full candidate profile, status management, cover note, and **Resume Panel** with secure "View" and "Download" actions.                                                        |
| `/admin/calendar`               | Training Calendar          | Tabbed manager: Scheduled Sessions (multi-filter, pagination, duplication) and Calendar Course Codes (order, session count guard). |
| `/admin/calendar/sessions/new` & `/[id]` | Session Form      | Schedule intake with course select, type, native date pickers, auto-end date, live overlap warning, and "Save & Add Another". |
| `/admin/courses`               | Course Management          | Search by keyword, status filter (`ACTIVE` / `INACTIVE`), category and subcategory filters, pagination, optimistic status toggle, preview links.                                                                |
| `/admin/courses/new` & `/[id]` | Course Form                | Auto-slug, category selector, dependent grouped subcategory selector, detailed syllabus (Objective, Content, Who Should Attend, Certification, Notes, Capacity, Fee override, Support) with Write/Preview & counters. |
| `/admin/categories`            | Categories                 | Discipline manager, course and subcategory count tracking, "Subcategories" management action, modal create/edit dialog, **safeguards: deletion blocked if courses or subcategories exist**. |
| `/admin/categories/[categoryId]/subcategories` | Subcategories | Hierarchical subcategory table (children indented under parent), course counts, order, optimistic status switch, modal create/edit dialog with parent select, **safeguards: deletion blocked if courses or children exist**. |
| `/admin/team`                  | Team & Faculty             | Search, placement filters (`Management` / `Instructor`), optimistic status toggles.                                                                                           |
| `/admin/team/new` & `/[id]`    | Team Member Form           | Leadership and instructor profiles, placement checkboxes, expertise tag chips, portrait photo upload.                                                                         |
| `/admin/news`                  | News Articles              | Filter by section (`FEATURED`, `STORY`, `PICK`), status switch, public article links.                                                                                         |
| `/admin/news/new` & `/[id]`    | News Post Form             | Contextual fields, date picker, media upload, **Body (Markdown)** textarea with Write/Preview tabs, slug change warning.                                                      |
| `/admin/careers`               | Careers & Job Openings     | Table of openings with search, employment type tags, order, optimistic status switch, deletion confirmation.                                                                  |
| `/admin/careers/new` & `/[id]` | Job Opening Form           | Title, employment type (Full Time / Part Time / Contract / Internship), location, scope, summary counter (max 600 chars), order.                                              |
| `/admin/contact`               | Contact Details & Channels | Grouped by type (Address, Phone, WhatsApp, Email, Hours, Social) with adaptive dialog, status switch, and **Live Footer Preview**.                                            |
| `/admin/legal`                 | Legal & Policy Documents   | Table of documents with canonical URLs, footer link status, last updated, status switch, and **core document protection**.                                                    |
| `/admin/legal/new` & `/[id]`   | Legal Page Form            | Title, slug (auto-suggested, locked for core pages), meta description (max 200), **Markdown body (Write/Preview tabs)**, dynamic placeholder tokens, footer placement toggle. |
| `/admin/faqs`                  | FAQs                       | Question and answer list, display order configuration, modal create/edit dialog.                                                                                              |
| `/admin/settings`              | Account Security           | Change admin password with current password verification.                                                                                                                     |
| `/admin/login`                 | Authentication Portal      | Rate-limited login (max 5 failed attempts / 15 min), timing equalization, session cookie issuance.                                                                            |

---

## 7. Markdown Content & Dynamic Placeholder Tokens

The administrative portal supports rich text formatting powered by `react-markdown`:

### Markdown Security Rules

- **No Raw HTML**: HTML tags are never interpreted as raw DOM elements to prevent XSS.
- **No Embedded Images**: `<img>` elements in Markdown are disallowed to preserve layout integrity.
- **Strict URL Scheme Validation**: Links only allow `https://`, `http://`, `mailto:`, `tel:`, or relative paths (`/path`). Protocols like `javascript:` and `data:` are rejected.
- **External Link Safeguards**: All external hyperlinks open in a new tab with `rel="noopener noreferrer"`.
- **Shared Design Tokens**: Markdown headings, body text, lists, and code blocks use identical typography and colors (`font-display`, `text-muted-foreground`, `brand-red`).

### Dynamic Placeholder Tokens in Legal Documents

Policy documents (`Privacy Policy`, `Terms of Service`, etc.) support dynamic placeholders that are replaced on the server at render time from the active contact details in MongoDB:

- `{{email}}`: Replaced with the first active email address.
- `{{phone}}`: Replaced with the first active phone number.
- `{{address}}`: Replaced with the first active office address.
- Any unrecognized tokens remain unchanged as plain text.

---

## 8. Security Architecture & Spam Protection

1. **Server-Side Enforcement**:
   - Every admin route, query, and server action invokes `await requireAdmin()`.
   - Never relies on client cookies or edge middleware alone; JWT verification occurs with cryptographic HS256 validation.
2. **Timing Attack Protection**:
   - Failed email lookups during login run `bcrypt.compare` against a pre-computed dummy hash to equalize response times against user enumeration.
3. **Login Rate Limiting**:
   - Managed via the `LoginAttempt` MongoDB collection.
   - 5 failed login attempts per 15-minute window per IP + Email results in an automatic lock with retry timer.
4. **Public Form Rate Limiting & Spam Protection**:
   - Generalised rate limiter backed by `LoginAttempt` with scope prefixes: `lead` (5 submissions / hour) and `application` (3 submissions / hour).
   - Keyed by a keyed HMAC-SHA256 hash of the client IP address (`x-forwarded-for`) using `AUTH_SECRET`. **Raw IP addresses and user agents are never persisted in the database.**
   - Hidden honeypot fields (`website`) detect automated bots and silently return success without database writes.
5. **Data Isolation**:
   - Public queries in `src/server/queries/` **always** enforce `status: "ACTIVE"`.
   - Inactive items immediately disappear from public pages.
   - Passwords (`passwordHash`) are never selected in session queries and never leave the server.
6. **Crawler Protection**:
   - `next.config.ts` sends `X-Robots-Tag: noindex, nofollow` on all `/admin/:path*` routes.
   - `src/app/robots.ts` explicitly disallows `/admin` routes.
   - Admin layouts specify `robots: { index: false, follow: false }`.

---

## 9. Media & File Storage Architecture

### Public Image Media (`UPLOAD_DIR`)

All media uploaded via the admin portal (course banners, team portraits, news heroes) is stored on local disk:

1. **Storage Structure**:
   ```
   UPLOAD_DIR/
   ├── courses/
   ├── team/
   └── news/
   ```
2. **Security & Validation**:
   - Validates file size (max 5 MB).
   - Validates MIME type AND magic bytes (detects real file content: JPEG, PNG, WebP). Rejects corrupted or spoofed extensions.
   - Generates collision-proof cryptographically secure filenames (`crypto.randomUUID()`).
   - Rejects user-supplied filenames and directory traversal characters (`../`).
3. **Serving Route**:
   - Serves uploaded media through dynamic route handler `/uploads/[...path]`.
   - Strictly enforces path confinement within `UPLOAD_DIR`.
   - Sends security headers: `X-Content-Type-Options: nosniff` and `Cache-Control: public, max-age=31536000, immutable`.

### Private Resume Storage (`PRIVATE_UPLOAD_DIR`)

Candidate resumes uploaded through `/careers` are treated with strict confidentiality and must **NEVER** be publicly accessible:

1. **Storage Confinement**:
   - Resumes are written exclusively to `PRIVATE_UPLOAD_DIR/resumes/<uuid>.<ext>`.
   - Never stored inside `public/`, `src/assets/`, or the public `UPLOAD_DIR`.
   - In development: defaults to `<project>/private-uploads` (gitignored).
   - In production: strictly required to be an absolute path **outside the application root** (e.g. `/home/<cpanel-user>/altair-assets/private-uploads`).
2. **Strict File & Magic Byte Verification**:
   - Maximum file size: 5 MB.
   - Extension allow-list: `.pdf`, `.doc`, `.docx`.
   - Magic bytes verification protects against renamed executables or malicious files:
     - PDF: `%PDF-` header.
     - DOCX: Zip archive magic bytes `PK\x03\x04`.
     - DOC: Microsoft Compound File Binary OLE header `D0 CF 11 E0 A1 B1 1A E1`.
3. **Protected Admin-Only Streaming Route**:
   - Accessible only via `GET /admin/applications/[id]/resume` (add `?download=1` for forced attachment).
   - Session verification: returns HTTP 401 if not authenticated as an admin.
   - Sends defensive HTTP response headers:
     - `Content-Type`: strictly set from the verified MIME type.
     - `X-Content-Type-Options: nosniff`.
     - `Cache-Control: private, no-store`.
     - `Content-Disposition`: `inline` for PDFs (allowing in-browser preview) and `attachment` for Word documents or when requested with `?download=1`.

---

## 10. Floating WhatsApp Quick-Access Button

- Rendered from `src/components/site/Footer.tsx` so it appears automatically across all public pages while strictly excluded from `/admin/*`.
- Dynamically queries the first active `WHATSAPP` channel from MongoDB; if no active WhatsApp channel exists, renders nothing.
- Positioned fixed at `bottom-5 right-5` with iOS safe-area inset support (`env(safe-area-inset-bottom)`).
- Styled in official WhatsApp green (`#25D366`), 56px round with hover lift and focus outline. Respects `prefers-reduced-motion` and is hidden in print.

---

## 11. Newsletter Subscription & Admin Subscribers Module

### Data Model (`NewsletterSubscriber`)

The `NewsletterSubscriber` MongoDB collection stores public newsletter subscriptions:

```prisma
enum SubscriberStatus {
  ACTIVE
  UNSUBSCRIBED
}

model NewsletterSubscriber {
  id               String           @id @default(auto()) @map("_id") @db.ObjectId
  email            String           @unique
  status           SubscriberStatus @default(ACTIVE)
  source           String           @default("footer")
  unsubscribeToken String           @unique
  subscribedAt     DateTime         @default(now())
  unsubscribedAt   DateTime?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@index([status, subscribedAt])
}
```

- **Email Sanitation**: Stored trimmed and lowercased to prevent duplicate records with different casing.
- **Privacy Preservation**: No IP addresses, device identifiers, or user agent strings are stored.
- **Unsubscribe Tokens**: Cryptographically secure, URL-safe tokens (32+ bytes base64url generated via Node `crypto.randomBytes(32)`).

### Public Footer Form (`NewsletterForm.tsx`)

- **Server Action**: Form submission is handled by `subscribeNewsletter` (`src/app/newsletter/actions.ts`, `"use server"`) using React `useActionState`.
- **Anti-Enumeration Neutral Response**: Always returns `"Thanks for subscribing!"` for valid submissions whether the address is new, already active, or reactivated from an unsubscribed state, preventing email harvesting attacks.
- **Honeypot Bot Trap**: Hidden `website` field silently accepted without storing.
- **Rate Limiting**: Integrated with `checkRateLimit("newsletter")` (5 attempts per hour per client, keyed by HMAC-SHA256 of the client IP using `AUTH_SECRET`).
- **Accessibility & Layout**: 44px minimum touch targets, ARIA live region (`role="status"`), explicit input autocomplete, and mobile bottom clearance preventing collisions with the floating WhatsApp button.

### Unsubscribe Page (`/newsletter/unsubscribe?token=<token>`)

- Public, unindexed page (`robots: { index: false, follow: false }`).
- Looks up the subscriber by `unsubscribeToken`.
- If the token is invalid or missing, renders a neutral `"This link is not valid."` message.
- If valid, prompts confirmation to transition status to `UNSUBSCRIBED` and sets `unsubscribedAt`.

### Admin Subscribers Page (`/admin/subscribers`)

- Integrated into the **Inbox** sidebar navigation group and overview metrics.
- Summary cards: Total Subscribers, Active Subscribers, Unsubscribed, and New in the Last 30 Days.
- Paginated and searchable table with status filtering (All, Active, Unsubscribed) and deterministic `Asia/Kuala_Lumpur` timestamps.
- Optimistic row status toggling (ACTIVE ⇄ UNSUBSCRIBED) with error rollback and deletion confirmation via `DeleteDialog`.
- Protected by `requireAdmin()`.

### Streaming CSV Export (`GET /admin/subscribers/export?scope=active|all`)

- **Authentication**: Requires admin session verification first; unauthenticated requests receive HTTP 401 with no body details.
- **Memory-Safe Streaming**: Uses Web `ReadableStream` with cursor-based batching by `id` (1,000 records per batch) ordered by `subscribedAt` ascending, avoiding high memory consumption on large subscriber lists.
- **Excel Compatibility**: Emits UTF-8 Byte Order Mark (`\uFEFF`), CRLF (`\r\n`) line endings, and RFC 4180 standard double-quoting.
- **Formula Injection Defense**: If a cell value begins with `=`, `+`, `-`, `@`, tab (`\t`), or carriage return (`\r`), it is prefixed with a single quote (`'`) to neutralize spreadsheet command execution vulnerabilities.
- **Download Headers**:
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="newsletter-subscribers-YYYY-MM-DD.csv"` (date formatted in `Asia/Kuala_Lumpur`)
  - `Cache-Control: private, no-store`
  - `X-Content-Type-Options: nosniff`

---

## 12. Training Calendar Module & Data Flow

### The Data Models

The training calendar is backed by two MongoDB models defined in `prisma/schema.prisma`:

1. **`CalendarCourse`**:
   - `id`: MongoDB ObjectId (`@id @default(auto()) @map("_id") @db.ObjectId`).
   - `code`: Unique alphanumeric course abbreviation (2–12 uppercase characters, digits, or hyphens, e.g., `UT`, `MT`, `PT`, `PAUT`, `TOFD`, `RI`).
   - `name`: Full title of the course (e.g., "Ultrasonic Testing").
   - `order`: Display sequence integer (`Int @default(0)`).
   - `status`: `Status` enum (`ACTIVE` or `INACTIVE`).
   - `sessions`: Relation array to scheduled `CalendarSession` records (`onDelete: Restrict`).

2. **`CalendarSession`**:
   - `id`: MongoDB ObjectId.
   - `courseId`: Foreign key to `CalendarCourse` (`@db.ObjectId`, indexed).
   - `kind`: `SessionKind` enum (`TRAINING` or `EXAM`).
   - `level`: Optional certification level string (e.g., `"Level 2"`).
   - `startDate`: Inclusive start date string formatted strictly as `"YYYY-MM-DD"`.
   - `endDate`: Inclusive end date string formatted strictly as `"YYYY-MM-DD"`.
   - `timeLabel`: Optional time display override (defaults to `"09:00 – 17:00 SST"` for training and `"09:00 – 13:00 SST"` for exams).
   - `location`: Optional venue string (e.g., `"Masai, Johor centre"`).
   - `note`: Optional administrative or candidate note (max 300 characters).
   - `status`: `Status` enum (`ACTIVE` or `INACTIVE`).
   - Composite unique constraint: `@@unique([courseId, kind, startDate, endDate])` (prevents exact duplicates and guarantees safe idempotent seeding).
   - Compound index: `@@index([status, startDate])`.

### Why Dates are Stored as "YYYY-MM-DD" Strings

Calendar schedules represent discrete calendar days on a wall calendar rather than point-in-time instantaneous moments. Storing calendar dates as UTC `DateTime` objects or UNIX timestamps causes several critical issues:
1. **Timezone Shifts**: A Date object created on a machine in UTC-5 or UTC+12 would shift the displayed day to the previous or next day depending on the client or server's local offset.
2. **Deterministic String Comparison**: `"YYYY-MM-DD"` strings naturally sort in chronological order lexicographically, allowing exact equality, sorting, and range queries directly in MongoDB without timezone distortions.
3. **Zero Hydration Mismatch**: Date-only strings parsed into numerical components (`year, month, day`) render identical DOM on both SSR and client paint, preventing React hydration mismatches.
4. **Client-Side Interpretation**: Client components construct local dates exclusively using `new Date(year, month - 1, day)` for calendar matrix generation, ensuring consistent day-of-week calculation in the user's browser without shifting the target date.

### Public Page Data Flow (`/calendar`)

1. **Server Component**: `src/app/calendar/page.tsx` is configured with `export const dynamic = "force-dynamic"`.
2. **Server-Only Queries**: Queries `getActiveCalendarSessions()` and `getActiveCalendarCourses()` from `src/server/queries/calendar.ts`. Only records where `session.status === ACTIVE` and `course.status === ACTIVE` are returned.
3. **DTO Serialization**: Returns plain serializable DTOs (strings only; no Prisma instances or Date objects).
4. **Dynamic Metadata**: `generateMetadata()` inspects all active sessions to determine `displayYear` (current year if sessions exist, otherwise latest year with sessions). The meta description dynamically lists all active course codes (e.g. `"UT, MT, PT, PAUT, TOFD and RI"` for the seeded data) matching the baseline text.
5. **Client Shell (`CalendarViewer.tsx`)**:
   - Parses date strings into local `Date` objects (`new Date(y, m - 1, d)`).
   - Computes distinct years for the year picker and distinct certification levels for the hero subtitle (`Level 2 · Year 2026`).
   - Supports multi-day sessions spanning across months (e.g. `28 Jan – 2 Feb 2026`), showing the session on every covered day in both months.
   - Clamps month navigation arrows to January–December of the selected year.
   - Initial day/month are aligned with today's date in `useEffect` only if today falls in the display year, ensuring zero hydration warnings.
   - Displays a friendly empty state if no sessions exist.

### Admin Dashboard (`/admin/calendar`)

The admin calendar module is organized into two tabs:

#### 1. Scheduled Sessions Tab
- **Table**: Displays Course (code badge + title + level), Session Type badge (`Training` in navy, `Exam` in brand-red), Formatted Dates (`formatDateOnlyRange`), Schedule Time, Location/Notes, Optimistic Status Switch, and Actions (Edit, Duplicate, Delete).
- **Filters**:
  - `Year`: Selects a specific intake year (defaults to the current year or latest year with sessions).
  - `Month`: Filters by month (January through December).
  - `Course`: Filters by specific course code.
  - `Type`: Filters by `Training` or `Examination`.
  - `Status`: Filters between `ACTIVE` and `INACTIVE`.
  - `Upcoming only`: Filters sessions where `endDate >= today` in `Asia/Kuala_Lumpur` (MYT).
  - `Search`: Substring search over location, notes, and level.
  - `Pagination`: Configurable page size (15 per page) with total count indicators.
- **Duplication Action**: Clicking "Duplicate" opens the new session form pre-populated with the source session's course, type, level, time label, location, note, and status, with the start and end dates cleared for rapid entry.

#### 2. Course Codes Tab
- **Table**: Displays code abbreviation, full name, display order sequence, attached session count badge, optimistic status switch, and actions (Edit, Delete).
- **Create/Edit Dialog**: Accessible modal allowing modification of course code (uppercase), title, sequence order, and status.
- **Safeguards**:
  - **Deletion Blocker**: Deleting a course code that currently has scheduled sessions is strictly blocked with a message: `"Delete or move its N sessions first"`.
  - **Public Visibility Notice**: A helper banner reminds administrators that setting a course code to `INACTIVE` automatically hides that course and all its sessions from the public calendar.

### How to Add a Month of Sessions

To add a new month of intakes (e.g., January 2027):
1. Navigate to `/admin/calendar` in the admin dashboard.
2. Click **Add Session** (or use **Duplicate** on an existing session).
3. Select the **Course Method** (e.g., `UT`) and **Session Type** (e.g., `Training`).
4. Enter the **Start Date** via the native date picker (e.g., `2027-01-11`). Notice that the **End Date** automatically fills with the same date for single-day sessions.
5. If multi-day, select the **End Date** (e.g., `2027-01-22`). The day span counter verifies the duration (maximum 31 days).
6. Verify the non-blocking **Overlap Helper**: if an existing session overlaps, an informational banner appears without blocking submission.
7. Click **Save & Add Another**: the session is saved, and the form resets with the same course and type selected, allowing you to immediately add the examination session (e.g., `2027-01-23` to `2027-01-24`).
8. Repeat for subsequent methods (`MT`, `PT`, etc.) and return to the calendar table.

### How the Seed Maps the Old Data

1. The raw legacy calendar schedule is stored in `prisma/seed-data/calendar.ts` as `seedCalendarCourses` and `seedCalendar2026Level2`.
2. In `prisma/seed.ts`, the seed script runs in safe insert-only mode:
   - Populates `CalendarCourse` records matching by `code` (`order = array order`, `status: ACTIVE`).
   - Parses the legacy slot string ranges (`"a-b"` or `"a"`) for each month in 2026.
   - Validates that each parsed date is a real calendar date (rejecting invalid combinations like Feb 30).
   - Creates each `CalendarSession` with `kind: TRAINING` or `kind: EXAM`, `level: "Level 2"`, and `status: ACTIVE`.
   - Idempotency is guaranteed by `@@unique([courseId, kind, startDate, endDate])`: existing records are skipped without modifying admin changes.

---

## 13. Course Subcategories & Dynamic Hierarchy

The course catalog supports a flexible 2-level subcategory hierarchy under each category, enabling multi-level navigation and filtering both in the admin dashboard and on the public site.

### Subcategory Data Model & Depth Rule

```prisma
model Subcategory {
  id         String        @id @default(auto()) @map("_id") @db.ObjectId
  categoryId String        @db.ObjectId
  category   Category      @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  parentId   String?       @db.ObjectId
  parent     Subcategory?  @relation("SubcategoryHierarchy", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children   Subcategory[] @relation("SubcategoryHierarchy")
  slug       String
  name       String
  order      Int           @default(0)
  status     Status        @default(ACTIVE)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  courses    Course[]

  @@unique([categoryId, slug])
  @@index([categoryId, parentId, order])
  @@index([parentId])
}
```

- **Maximum Depth Rule (2 Levels Below Category)**:
  - A subcategory is either **top-level** (`parentId: null`), or a **child** of a top-level subcategory (`parentId != null`).
  - A child subcategory **cannot have children** (enforced strictly on the server in create and update actions).
  - The parent subcategory must belong to the **same category** as the child (`parentId.categoryId === categoryId`).
  - Slugs are unique per category (`@@unique([categoryId, slug])`).
  - Moving a subcategory to another category is disallowed; administrators should create a new one instead.

### Admin Subcategory Management (`/admin/categories/[categoryId]/subcategories`)

- Accessible via the **Subcategories (count)** button on each category row in `/admin/categories`.
- Displays a hierarchical table where child subcategories are visually indented under their parent with a `CornerDownRight` icon.
- **Add / Edit Modal Dialog**:
  - `Name`: 2 to 100 characters.
  - `Slug`: Auto-generated from name with hyphenation, editable, unique per category. Duplicate slugs return immediate inline field errors.
  - `Parent`: Select either "None (Top-level subcategory)" or any existing top-level subcategory of this category. Hidden when editing a subcategory that already has children to maintain the depth rule.
  - `Order`: Integer from 0 to 9999 for deterministic display ordering.
  - `Status`: `ACTIVE` or `INACTIVE`. Inactivating a subcategory hides it and its children from public menus and filter pills without hiding assigned courses.
- **Strict Delete Safeguards**:
  - Deleting a subcategory with assigned courses is blocked: `"Cannot delete subcategory: N course(s) are assigned to it. Reassign or delete those courses first."`
  - Deleting a parent subcategory with children is blocked: `"Cannot delete subcategory: has child subcategories. Delete or reassign child subcategories first."`
  - Deleting a category with subcategories is blocked: `"Cannot delete category: has N subcategory/subcategories. Delete them first."`

### Course Form Subcategory Dropdown (`/admin/courses/new` & `/[id]`)

- Placed directly beneath the **Category** dropdown in the "Core information" section, sharing the same Radix/shadcn `Select` component and design tokens.
- **Dynamic Grouping & Filtering**:
  - Subcategories are loaded once and filtered client-side by the selected category.
  - Top-level subcategories with children are presented as option groups (`SelectGroup` + `SelectLabel` with the parent name). The parent is selectable as `<Parent> (general)` followed by its indented children.
  - Subcategories without children are rendered as plain options.
  - The first option is `None`, which clears the subcategory selection (`subcategoryId: null`).
  - If a category has no subcategories, the dropdown is disabled with the placeholder `"No subcategories for this category"`.
  - Changing the Category automatically resets the selected Subcategory to `None`.
  - Inactive subcategories are excluded from the dropdown, except when editing a course already assigned to an inactive subcategory (labeled with `(inactive)`).
- **Server-Side Validation**:
  - `createCourseAction` and `updateCourseAction` verify that the provided `subcategoryId` exists and belongs to the selected `categoryId`. Forged or mismatched requests are rejected with a field error.

### Public Course Filtering & Multi-Row Pills (`/courses`)

- The course catalog supports URL query parameters: `/courses?category=<categorySlug>&subcategory=<subcategorySlug>`.
- **Hierarchical Pill Navigation**:
  - **Row 1 (Categories)**: All active categories (with "All Courses" reset pill).
  - **Row 2 (Top-level Subcategories)**: Displayed when the selected category has active subcategories. Features an `All <Category Name>` pill followed by top-level subcategory pills.
  - **Row 3 (Child Subcategories)**: Displayed when the selected top-level subcategory has children. Features an `All <Parent Name>` pill followed by child subcategory pills.
- **Filter Resolution**:
  - Filtering by a **top-level subcategory** returns courses assigned directly to that subcategory **and** courses assigned to any of its children.
  - Filtering by a **child subcategory** returns only courses assigned to that specific child.
  - Invalid, unknown, or mismatched subcategories gracefully fall back to displaying the category's courses without an error page.
- **Course Cards & Details**:
  - `CourseCard` and `FeaturedCourseCard` display the subcategory name as a chip alongside the category badge.
  - The course detail page (`/courses/[slug]`) displays the subcategory chip in the hero badges and the sidebar summary.
  - Course search (`/search?q=...`) matches both course titles/descriptions and subcategory names.

### Database-Driven Header Navigation Menu

- The static `src/data/menu.ts` has been removed. The "Our Courses" navigation flyout is now populated dynamically from MongoDB via `getHeaderMenu()` in `src/server/queries/menu.ts`.
- `Header.tsx` is an async Server Component that queries active categories and active 2-level subcategories, passing the navigation tree to `HeaderClient.tsx`.
- The client implementation preserves exact hover flyouts, mobile hamburger navigation, keyboard accessibility, search dialog, and design tokens.
- The footer (`Footer.tsx`) queries active categories dynamically from `getActiveCategories()`.

---

## 14. Troubleshooting

### Problem: "Transactions are not supported by this deployment"

- **Cause**: Prisma requires MongoDB multi-document transactions, which only function on a replica set. Standalone MongoDB instances will fail.
- **Solution**: Follow [docs/LOCAL_MONGODB_SETUP.md](LOCAL_MONGODB_SETUP.md) for local replica set or use MongoDB Atlas.

### Problem: "Could not connect to database / IP address not allowed"

- **Cause**: MongoDB Atlas Network Access rules are blocking your IP address.
- **Solution**: In MongoDB Atlas -> Network Access -> Add IP Address -> Add your current outbound IP address.

### Problem: "PrismaClientInitializationError: Prisma Client has not been generated yet"

- **Cause**: Prisma Client artifacts were not generated.
- **Solution**: Run `npm run db:generate` or `npm run postinstall`.
