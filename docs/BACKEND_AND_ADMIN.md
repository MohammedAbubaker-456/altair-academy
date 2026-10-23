# Altair Academy — Backend & Admin Dashboard Guide

This document describes the backend architecture, MongoDB + Prisma setup, authentication, administration portal, and deployment guidelines for Altair Academy.

---

## 1. Prerequisites & Environment Setup

### Required Services
1. **MongoDB (Replica Set required)**: Prisma requires a MongoDB replica set to support multi-document transactions.
   - **Option A (Production / Cloud)**: MongoDB Atlas (free M0 cluster or higher). Atlas operates as a replica set by default.
   - **Option B (Local Development)**: Native local MongoDB running as a single-node replica set (see [docs/LOCAL_MONGODB_SETUP.md](file:///d:/Altair.Academy/altair-academy-website-main/docs/LOCAL_MONGODB_SETUP.md)). No Docker.
2. **Node.js**: v20.9.0 or higher.

### Environment Configuration (.env)
Create a `.env` file at the root of the project (modeled after `.env.example`):

```bash
# ==============================================================================
# DATABASE CONFIGURATION (MongoDB with Replica Set)
# ==============================================================================
# Atlas example (Production):
# DATABASE_URL="mongodb+srv://<user>:<url-encoded-password>@<cluster>.mongodb.net/altair-academy?retryWrites=true&w=majority"
# Native Local MongoDB replica set (Development):
DATABASE_URL="mongodb://127.0.0.1:27017/altair-academy?replicaSet=rs0"
```

---

## 2. Local Database Initialization (Native Replica Set — No Docker)

Prisma requires MongoDB multi-document transactions. For local development, follow the complete native installation and replica set initiation guide in:
👉 **[docs/LOCAL_MONGODB_SETUP.md](file:///d:/Altair.Academy/altair-academy-website-main/docs/LOCAL_MONGODB_SETUP.md)**

Quick checklist:
1. Install MongoDB Community Server and `mongosh` natively.
2. In `mongod.conf` / `mongod.cfg`, add:
   ```yaml
   replication:
     replSetName: rs0
   ```
3. Restart the MongoDB service.
4. Open `mongosh` and execute once: `rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] })`.
5. Verify with `npm run db:check`.

---

## 3. Database Sync & Seeding

MongoDB does not support traditional SQL migration files. Prisma uses schema synchronization via `db push`.

### Step 1: Generate Prisma Client
```bash
npm run db:generate
```

### Step 2: Push Schema to MongoDB
Pushes collections, indexes, and constraints to your MongoDB database:
```bash
npm run db:push
```

### Step 3: Seed Initial Data & First Administrator
Populates all categories, courses, unified team members, news posts, FAQs, and creates the first admin user:
```bash
npm run db:seed
```
*Note: The seed script is completely idempotent. Running it multiple times safely upserts records without creating duplicates.*

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

| Route | Purpose | Key Features |
|---|---|---|
| `/admin` | System Overview | Counts of active vs inactive entities, quick action shortcuts, database status. |
| `/admin/courses` | Course Management | Search by keyword, status filter (`ACTIVE` / `INACTIVE`), pagination, optimistic status toggle, preview links. |
| `/admin/courses/new` | Create Course | Auto-slug generation, category selector, syllabus, duration, price, Cloudinary image upload, home showcase toggle. |
| `/admin/courses/[id]` | Edit Course | Update course details, replace/remove image, modify status. |
| `/admin/categories` | Categories | Discipline manager, course count tracking, modal create/edit dialog, **safeguard: deletion is blocked if courses are assigned**. |
| `/admin/team` | Team & Faculty | Search, placement filters (`Management` / `Instructor`), optimistic status toggles. |
| `/admin/team/new` & `/[id]` | Team Member Form | Unified leadership and instructor profile, placement checkboxes, interactive expertise tag chips, portrait photo upload. |
| `/admin/news` | News Articles | Filter by section (`FEATURED`, `STORY`, `PICK`), status switch. |
| `/admin/news/new` & `/[id]` | News Post Form | Contextual fields (Category label for Hero, tag chips for Stories), date picker, media upload. |
| `/admin/faqs` | FAQs | Question and answer list, display order configuration, modal create/edit dialog. |
| `/admin/settings` | Account Security | Change admin password with current password verification. |
| `/admin/login` | Authentication Portal | Rate-limited login (max 5 failed attempts / 15 min), timing equalization, session cookie issuance. |

---

## 7. Security Architecture & Controls

1. **Server-Side Enforcement**:
   - Every admin route and server action invokes `await requireAdmin()`.
   - Never relies on client cookies or edge middleware alone; JWT verification occurs with cryptographic HS256 validation.
2. **Timing Attack Protection**:
   - Failed email lookups during login run `bcrypt.compare` against a pre-computed dummy hash to equalize response times against user enumeration.
3. **Brute-Force Rate Limiting**:
   - Managed via the `LoginAttempt` MongoDB collection.
   - 5 failed login attempts per 15-minute window per IP + Email results in an automatic lock with retry timer.
4. **Data Isolation**:
   - Public queries in `src/server/queries/` **always** enforce `status: "ACTIVE"`.
   - Inactive items immediately disappear from public pages.
   - Passwords (`passwordHash`) are never selected in session queries and never leave the server.
5. **Crawler Protection**:
   - `next.config.ts` sends `X-Robots-Tag: noindex, nofollow` on all `/admin/:path*` routes.
   - `src/app/robots.ts` explicitly disallows `/admin` routes.
   - Admin layouts specify `robots: { index: false, follow: false }`.

---

## 8. On-Demand Cache Revalidation

Public pages are served dynamically from the MongoDB database. Whenever an admin creates, updates, deletes, or toggles an entity's status:
- The server action calls `revalidatePublicData()`.
- Internally, this executes `revalidatePath("/", "layout")`.
- Next.js invalidates the full page cache, serving fresh data to public visitors within seconds without full rebuilds.

---

## 9. Cloudinary Image Storage

Uploaded images are handled server-side without writing to disk (critical for serverless hosting like Vercel or Netlify):
- The client sends an image file via `FormData` to `uploadImageAction`.
- The action verifies admin authentication, validates the MIME type (`image/jpeg`, `image/png`, `image/webp`), and enforces a 5MB maximum file size.
- The file buffer is streamed directly to Cloudinary into entity-specific folders (`altair-academy/courses`, `altair-academy/team`, `altair-academy/news`).
- Deleting a course, team member, or news post automatically triggers best-effort deletion of its hosted image from Cloudinary.

---

## 10. Troubleshooting

### Problem: "Transactions are not supported by this deployment"
- **Cause**: Prisma requires MongoDB multi-document transactions, which only function on a replica set. Standalone MongoDB instances will fail.
- **Solution**: Use MongoDB Atlas (which runs a replica set by default) or configure your native local MongoDB as a replica set following [docs/LOCAL_MONGODB_SETUP.md](file:///d:/Altair.Academy/altair-academy-website-main/docs/LOCAL_MONGODB_SETUP.md).

### Problem: "Could not connect to database / IP address not allowed"
- **Cause**: MongoDB Atlas Network Access rules are blocking your IP address.
- **Solution**: In MongoDB Atlas -> Network Access -> Add IP Address -> Add your current IP address (or `0.0.0.0/0` with secure credentials).

### Problem: "PrismaClientInitializationError: Prisma Client has not been generated yet"
- **Cause**: Build system or CI environment did not generate Prisma Client artifacts.
- **Solution**: The `postinstall` script in `package.json` runs `prisma generate` automatically. Ensure your deployment build step executes `npm run build` with `DATABASE_URL` present.
