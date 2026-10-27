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
> - `db:push` syncs the new MongoDB collections (`Lead`, `CareerApplication`), adds indexes (`@@index([status, createdAt])`), and creates new `Course` syllabus fields (`objective`, `content`, `whoShouldAttend`, `certification`, `notesAndEquipment`, `classCapacity`, `feeDetails`, `courseSupport`).
> - `db:seed` performs safe, insert-only population: provisions or supplements the "API 510 Pressure Vessel Inspector" course draft without overwriting any existing administrator customizations.

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
| `/admin/courses`               | Course Management          | Search by keyword, status filter (`ACTIVE` / `INACTIVE`), pagination, optimistic status toggle, preview links.                                                                |
| `/admin/courses/new` & `/[id]` | Course Form                | Auto-slug, category selector, detailed syllabus (Objective, Content, Who Should Attend, Certification, Notes, Capacity, Fee override, Support) with Write/Preview & counters. |
| `/admin/categories`            | Categories                 | Discipline manager, course count tracking, modal create/edit dialog, **safeguard: deletion blocked if courses assigned**.                                                     |
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

## 11. Troubleshooting

### Problem: "Transactions are not supported by this deployment"

- **Cause**: Prisma requires MongoDB multi-document transactions, which only function on a replica set. Standalone MongoDB instances will fail.
- **Solution**: Follow [docs/LOCAL_MONGODB_SETUP.md](LOCAL_MONGODB_SETUP.md) for local replica set or use MongoDB Atlas.

### Problem: "Could not connect to database / IP address not allowed"

- **Cause**: MongoDB Atlas Network Access rules are blocking your IP address.
- **Solution**: In MongoDB Atlas -> Network Access -> Add IP Address -> Add your current outbound IP address.

### Problem: "PrismaClientInitializationError: Prisma Client has not been generated yet"

- **Cause**: Prisma Client artifacts were not generated.
- **Solution**: Run `npm run db:generate` or `npm run postinstall`.
