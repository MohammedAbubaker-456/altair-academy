# Altair Academy — Technical Training & Certification

Official technical training website and administrative management portal for Altair Academy. Built on Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui on Radix UI, MongoDB, and Prisma ORM 6.19.3.

Configured for native local development (single-node replica set) and production deployment on GoDaddy "Web Hosting Deluxe" (cPanel with Phusion Passenger) and MongoDB Atlas.

---

## Technology Stack

- **Framework**: Next.js 15 (App Router, Standalone Output)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 (`@theme` tokens, HSL palette)
- **UI Components**: shadcn/ui on Radix UI primitives
- **Database**: MongoDB (Atlas M0+ in production, native local replica set in development)
- **ORM**: Prisma 6.19.3 with multi-document transactions
- **Media Storage**: Server-disk persistent storage (`UPLOAD_DIR`) with magic-byte validation (no Cloudinary, no Docker)
- **Deployment**: GoDaddy Web Hosting Deluxe (Linux cPanel, Node.js 22, Phusion Passenger)

---

## Documentation Quick Links

- 📖 **[Local MongoDB Replica Set Guide (No Docker)](docs/LOCAL_MONGODB_SETUP.md)**: Native single-node replica set (`rs0`) setup for Windows, macOS, and Linux.
- 🚀 **[GoDaddy Web Hosting Deluxe Deployment Guide](docs/DEPLOYMENT_GODADDY_DELUXE.md)**: Step-by-step production deployment on cPanel with Phusion Passenger, MongoDB Atlas, and persistent media storage.
- 🛡️ **[Backend & Admin Guide](docs/BACKEND_AND_ADMIN.md)**: Architecture, authentication security, schema synchronization, and administration portal manual.
- 📂 **[Project Structure](docs/PROJECT_STRUCTURE.md)**: Comprehensive repository hierarchy and component overview.

---

## Local Development Setup

### 1. Prerequisites

- **Node.js**: `>=20.9.0` (Node 22 recommended)
- **MongoDB**: Community Server running natively as a replica set (`rs0`). Follow **[docs/LOCAL_MONGODB_SETUP.md](docs/LOCAL_MONGODB_SETUP.md)**.

### 2. Installation

```bash
git clone <repository-url>
cd altair-academy-website-main
npm install
```

### 3. Environment Setup

Copy the example configuration:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` points to your local replica set:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/altair-academy?replicaSet=rs0"
AUTH_SECRET="development-auth-secret-minimum-32-characters-for-jwt-signing"
ADMIN_EMAIL="admin@altairacademy.com"
ADMIN_PASSWORD="ChangeMeInProduction123!"
```

### 4. Database Verification & Seeding

```bash
# Verify connection and writable replica set status
npm run db:check

# Push Prisma schema to MongoDB
npm run db:push

# Seed categories, courses, faculty, news, FAQs, and initial admin
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The administrative portal is accessible at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Production Packaging for GoDaddy cPanel

Shared hosting servers have constrained CPU and memory and should never build applications on the server. Always package the standalone distribution:

```bash
npm run package:cpanel
```

This cross-platform script:

1. Runs `prisma generate` and builds the standalone application with `next build`.
2. Assembles `deploy/cpanel-package/` with native Linux Prisma engine (`rhel-openssl-3.0.x`) and Linux x64 `sharp` binaries.
3. Excludes environment secrets and persistent uploads.
4. Generates `deploy/altair-academy-cpanel.zip` and `deploy/altair-academy-cpanel.tar.gz`.

See **[docs/DEPLOYMENT_GODADDY_DELUXE.md](docs/DEPLOYMENT_GODADDY_DELUXE.md)** for complete cPanel deployment and configuration instructions.

---

## Available NPM Scripts

| Script                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `npm run dev`             | Starts local Next.js development server             |
| `npm run build`           | Compiles production standalone build                |
| `npm run start`           | Starts compiled standalone server                   |
| `npm run db:check`        | Tests MongoDB connection & replica set health       |
| `npm run db:generate`     | Generates Prisma Client artifacts                   |
| `npm run db:push`         | Pushes Prisma schema to MongoDB                     |
| `npm run db:seed`         | Seeds database with initial data                    |
| `npm run db:data-migrate` | Executes pending data migrations                    |
| `npm run admin:create`    | Interactively provisions new administrator accounts |
| `npm run package:cpanel`  | Assembles standalone Linux package for cPanel       |
| `npm run lint`            | Runs ESLint and Prettier validation                 |
