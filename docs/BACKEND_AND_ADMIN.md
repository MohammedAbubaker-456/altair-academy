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

# Optional in development (defaults to <project>/uploads outside src)
# UPLOAD_DIR="./uploads"

# Seed Admin Credentials
ADMIN_EMAIL="admin@altairacademy.com"
ADMIN_PASSWORD="ChangeMeInProduction123!"

# ==============================================================================
# PRODUCTION CONFIGURATION (GoDaddy cPanel / Setup Node.js App)
# ==============================================================================
# DATABASE_URL="mongodb+srv://<user>:<url-encoded-password>@<cluster>.mongodb.net/altair-academy?retryWrites=true&w=majority"
# AUTH_SECRET="generate-a-secure-random-64-character-string-via-openssl"
# UPLOAD_DIR="/home/<cpanel-user>/altair-assets/uploads"
```

---

## 2. CLI Commands Reference

| Command | Purpose | When to Run |
|---|---|---|
| `npm run dev` | Starts Next.js development server | Local development |
| `npm run build` | Compiles Next.js standalone application | Testing production build locally |
| `npm run db:check` | Verifies MongoDB connection & writable replica set | After starting local MongoDB or testing Atlas |
| `npm run db:generate` | Generates Prisma Client for native & Linux targets | After modifying `prisma/schema.prisma` |
| `npm run db:push` | Synchronizes Prisma schema with MongoDB | Schema updates (local or Atlas from local PC) |
| `npm run db:seed` | Seeds initial categories, courses, team, news, FAQs, admin | Initial database setup |
| `npm run db:data-migrate` | Runs sequential data migrations from `prisma/data-migrations/` | Schema evolution and transformations |
| `npm run admin:create` | Interactive CLI to provision additional admins | Account provisioning |
| `npm run package:cpanel` | Prepares standalone cPanel Linux deployment package | Preparing production release (`deploy/altair-academy-cpanel.zip`) |
| `npm run lint` | ESLint + Prettier code analysis | Code quality check |

---

## 3. Database Sync & Seeding

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
| `/admin/courses/new` | Create Course | Auto-slug generation, category selector, syllabus, duration, price, server-disk image upload, home showcase toggle. |
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

## 8. Server-Disk Persistent Image Storage (`UPLOAD_DIR`)

All media uploaded via the admin portal is stored directly on the server's local disk, completely replacing third-party image services like Cloudinary:

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
4. **Production Directory Separation**:
   - In production, `UPLOAD_DIR` must point to an absolute directory **outside** the application root (e.g. `/home/<cpanel-user>/altair-assets/uploads`).
   - This ensures uploading new deployment packages or extracting updates never deletes uploaded user images.

---

## 9. Troubleshooting

### Problem: "Transactions are not supported by this deployment"
- **Cause**: Prisma requires MongoDB multi-document transactions, which only function on a replica set. Standalone MongoDB instances will fail.
- **Solution**: Follow [docs/LOCAL_MONGODB_SETUP.md](LOCAL_MONGODB_SETUP.md) for local replica set or use MongoDB Atlas.

### Problem: "Could not connect to database / IP address not allowed"
- **Cause**: MongoDB Atlas Network Access rules are blocking your IP address.
- **Solution**: In MongoDB Atlas -> Network Access -> Add IP Address -> Add your current outbound IP address.

### Problem: "PrismaClientInitializationError: Prisma Client has not been generated yet"
- **Cause**: Prisma Client artifacts were not generated.
- **Solution**: Run `npm run db:generate` or `npm run postinstall`.
