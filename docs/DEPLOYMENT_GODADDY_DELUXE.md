# Complete Deployment Guide: GoDaddy Web Hosting Deluxe (cPanel + Node.js 22)

> **Document Purpose**: Step-by-step production deployment guide for Altair Academy on GoDaddy "Web Hosting Deluxe" shared Linux hosting using cPanel "Setup Node.js App" (Phusion Passenger), MongoDB Atlas, and server-disk persistent media storage.
>
> **Notice**: Wherever a hosting detail cannot be officially verified from public GoDaddy documentation or depends on your specific server provision, it is explicitly flagged with **`[VERIFY]`**.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │              Public Visitors                 │
                      │       (Singapore / Malaysia / Asia)          │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTPS
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │             Cloudflare Edge CDN              │
                      │  (Caches /_next/static/*, /seed/*, /uploads/*)│
                      └──────────────────────┬───────────────────────┘
                                             │ Origin HTTPS
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │    GoDaddy Web Hosting Deluxe (Europe DC)     │
                      │  cPanel Apache + Phusion Passenger           │
                      │                                              │
                      │  Application Root:                           │
                      │  /home/<user>/altair-app/                    │
                      │  ├── server.js (Next.js Standalone Node 22)  │
                      │  ├── app.js (Passenger Entrypoint)           │
                      │  ├── .next/ (Server Chunks & Traced Assets)  │
                      │  ├── public/ (Static & Seed Media)           │
                      │  └── tools/ (Diagnostics)                    │
                      │                                              │
                      │  Persistent Media Storage (OUTSIDE App Root):│
                      │  /home/<user>/altair-assets/uploads/         │
                      │  ├── courses/                                │
                      │  ├── team/                                   │
                      │  └── news/                                   │
                      └──────────────────────┬───────────────────────┘
                                             │ TLS / Port 27017
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │      MongoDB Atlas (Europe M0 / Dedicated)   │
                      │         Database: `altair-academy`           │
                      └──────────────────────────────────────────────┘
```

---

## Pre-Requisites Checklist

Before starting, ensure you have:
1. GoDaddy cPanel login credentials and domain assigned.
2. SSH access enabled in cPanel (**cPanel -> SSH Access -> Manage SSH Keys** or password-based SSH).
3. A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
4. Local computer with Node.js 22 and terminal.
5. MongoDB Database Tools (`mongodump` / `mongorestore`) installed locally for database backups.

---

## Step 1: MongoDB Atlas Configuration (Europe Region)

Shared hosting cannot run a native MongoDB service. Production uses MongoDB Atlas.

### 1.1 Determine the Exact Hosting Data Center
Log in to your GoDaddy server over SSH and run:
```bash
curl -s https://ipinfo.io
```
Note the `city`, `region`, and `country` (typically Frankfurt, Amsterdam, or London).

### 1.2 Create an Atlas Cluster in the Nearest European Region
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Click **Create Deployment** -> Select **M0 (Free)** (or dedicated M10+ if scaling).
3. Select Cloud Provider **AWS** or **Google Cloud**.
4. Choose the European region closest to your server's data center:
   - Frankfurt (`eu-central-1`)
   - Ireland (`eu-west-1`)
   - London (`eu-west-2`)
5. Click **Create Deployment**.

### 1.3 Create a Dedicated Database User
1. Navigate to **Security** -> **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set a strong username (e.g., `altair_app_user`).
5. Generate a secure 32-character password.
   > [!IMPORTANT]
   > **URL Encoding Special Characters**: If your generated password contains characters such as `@`, `:`, `/`, `?`, `#`, `[`, `]`, `!`, `$`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `;`, or `=`, you **MUST** URL-encode them in your connection string (e.g., `@` becomes `%40`, `!` becomes `%21`, `#` becomes `%23`). If left unencoded, the MongoDB driver will fail to parse your connection string.
6. Database User Privileges: Select **Specific Privileges** -> Grant `readWrite` on database `altair-academy`. Do not grant global cluster admin privileges.

---

## Step 2: SSH Setup & Server Discovery

### 2.1 Connect via SSH
Connect from your local terminal:
```bash
ssh <cpanel-username>@<your-server-ip-or-domain> -p 22
```
*(Port 22 is default; `[VERIFY]` whether your cPanel account uses port 22 or a custom port like 2222).*

### 2.2 Determine Server Outbound Public IP & Allowlist in Atlas
Run:
```bash
curl -s https://ifconfig.me
```
1. Copy the printed IP address.
2. In MongoDB Atlas, go to **Security** -> **Network Access** -> **Add IP Address**.
3. Enter your GoDaddy server's outbound IP address with `/32` (e.g., `198.51.100.24/32`), comment: `GoDaddy cPanel Outbound`.
4. > [!WARNING]
   > **Dynamic Shared IP Warning `[VERIFY]`**: On shared cPanel hosting, outbound requests may occasionally route through different shared gateway IPs. If your app later returns 503 or database timeout errors, re-check `curl -s https://ifconfig.me`.
   > **Fallback**: If GoDaddy uses rotating outbound NAT gateways, Atlas allows adding `0.0.0.0/0` (Allow access from anywhere). **Security implication**: Anyone who acquires your database credentials could connect. Therefore, only use this fallback if necessary, and ensure your database user has a 32+ character random password and access restricted to `altair-academy`.

### 2.3 Collect Server System Facts
Collect and record the exact OS environment facts:
```bash
uname -m
cat /etc/os-release
openssl version
```
- **Architecture**: If `x86_64`, it corresponds to `linux-x64`.
- **OpenSSL**: If OpenSSL 3.x is reported (e.g., OpenSSL 3.0.x on CloudLinux/RHEL 9), the Prisma binary target `rhel-openssl-3.0.x` is used (our preconfigured target). If OpenSSL 1.1.x is reported, note this so `binaryTargets` in `prisma/schema.prisma` can be adjusted.

---

## Step 3: Create Persistent Uploads Directory (OUTSIDE App Root)

> [!CRITICAL]
> **Why Uploads Must Live Outside the App Root**:
> When you deploy updates or extract a new application package, the application folder (`/home/<user>/altair-app/`) is replaced. If your uploaded media were stored inside the application directory, **every update would completely delete all uploaded images!**

Create the permanent uploads folder in your user's home directory:
```bash
# In your SSH session:
mkdir -p /home/<cpanel-user>/altair-assets/uploads/courses
mkdir -p /home/<cpanel-user>/altair-assets/uploads/team
mkdir -p /home/<cpanel-user>/altair-assets/uploads/news

# Set permissions so the cPanel web application process can read and write:
chmod -R 755 /home/<cpanel-user>/altair-assets
```
Take note of the absolute path:
```
/home/<cpanel-user>/altair-assets/uploads
```
This is the value you will provide for `UPLOAD_DIR`.

---

## Step 4: Database Schema & Seed Initialization (From Your Computer)

The packaged production archive is minimal and contains only the runtime server (no TypeScript runtime `tsx` or Prisma CLI). Therefore, schema synchronization and initial data seeding are executed once from your local development workstation targeting Atlas.

1. On your local machine, open your `.env` or set the temporary shell variable:
   ```bash
   # In your local project directory:
   export DATABASE_URL="mongodb+srv://altair_app_user:<encoded-password>@<your-cluster>.mongodb.net/altair-academy?retryWrites=true&w=majority"
   ```
2. Verify connectivity:
   ```bash
   npm run db:check
   ```
3. Push Prisma schema to Atlas:
   ```bash
   npm run db:push
   ```
4. Run initial database seed:
   ```bash
   npm run db:seed
   ```
5. > [!IMPORTANT]
   > Immediately change the default admin password upon your first login to `/admin/login`.
   > **Never commit your Atlas credentials or leave them in local `.env` files.** Reset your local `.env` back to local replica set development.

---

## Step 5: Build and Assemble the Standalone Package

On your local workstation (or via GitHub Actions):

### Option A: Local Build & Package
```bash
npm run package:cpanel
```
This script:
1. Runs `prisma generate` (pulling native and Linux query engines).
2. Executes `next build` (generating `.next/standalone`).
3. Assembles `deploy/cpanel-package/` with all static assets, seed images, tools, and startup files.
4. Verifies `server.js`, Prisma Linux engine (`libquery_engine-rhel-openssl-3.0.x.so.node`), and Linux x64 `sharp` binaries.
5. Strips all `.env*` files and local `uploads/` folders.
6. Produces `deploy/altair-academy-cpanel.zip` (~50 MB).

### Option B: GitHub Actions Workflow
If using GitHub:
1. Push your changes to branch `main`.
2. Go to **GitHub** -> **Actions** -> **Build cPanel Deployment Package**.
3. Download the `altair-academy-cpanel` artifact zip built natively on Ubuntu Linux.

---

## Step 6: cPanel "Setup Node.js App" Configuration

1. Log in to **GoDaddy cPanel**.
2. Under the **Software** section, click **Setup Node.js App** (CloudLinux Node.js Selector / Passenger).
3. Click **Create Application**.
4. Configure the fields exactly as follows:
   - **Node.js version**: `22.x` (or the highest 22 version available).
   - **Application mode**: `Production`.
   - **Application root**: `altair-app` (this creates `/home/<cpanel-user>/altair-app`, keeping it strictly OUTSIDE `public_html`).
   - **Application URL**: Select your domain (e.g. `altairacademy.com` or subdomain).
   - **Application startup file**: `app.js` (our package includes an `app.js` wrapper forwarding to `server.js`).
5. Click **Create**.
6. The UI will show a command at the top:
   ```bash
   source /home/<cpanel-user>/nodevenv/altair-app/22/bin/activate && cd /home/<cpanel-user>/altair-app
   ```
   Save this command; this is how you enter the app's Node virtual environment via SSH.

---

## Step 7: Upload and Extract Application Package

1. In cPanel, open **File Manager**.
2. Navigate to your application root: `/home/<cpanel-user>/altair-app/`.
3. If cPanel created default template files (e.g. `app.js`, `public/`), delete them so the directory is empty.
4. Click **Upload** at the top toolbar and upload `deploy/altair-academy-cpanel.zip`.
5. Select the uploaded zip file and click **Extract**.
6. Verify the extracted structure in `/home/<cpanel-user>/altair-app/`:
   - `app.js`
   - `server.js`
   - `package.json`
   - `.next/`
   - `node_modules/`
   - `public/` (including `public/seed/`)
   - `tools/`
7. Delete the uploaded `.zip` file from the server to save disk quota.
8. > [!CAUTION]
   > **Do NOT click "Run NPM Install" in cPanel `[VERIFY]`**:
   > The package is prebuilt with standalone dependencies and native Linux binaries. Running npm install on shared hosting risks exceeding memory limits and overwriting native Linux binaries.

---

## Step 8: Pre-Flight Verification over SSH

Before starting the server, run the diagnostic tools to ensure networking and database connectivity succeed:

1. Open SSH and enter the virtual environment:
   ```bash
   source /home/<cpanel-user>/nodevenv/altair-app/22/bin/activate && cd /home/<cpanel-user>/altair-app
   ```
2. Test network connectivity to Atlas:
   ```bash
   export DATABASE_URL="mongodb+srv://altair_app_user:<encoded-password>@<your-cluster>.mongodb.net/altair-academy?retryWrites=true&w=majority"
   node tools/connectivity-check.mjs
   ```
   **Expected Output**:
   ```
   ✔ Discovered 3 replica set nodes via DNS SRV.
   ✔ PASS: Connected to ...:27017
   ✔ ALL CHECKS PASSED: Outbound TCP traffic to MongoDB Atlas is working perfectly.
   ```
3. Test database authentication and replica set status:
   ```bash
   node tools/check-db.mjs
   ```
   **Expected Output**:
   ```
   ✔ SUCCESS: Connected to MongoDB successfully!
   Status: Writable Primary (Transactions Ready)
   ```

---

## Step 9: Configure Environment Variables in cPanel

In **cPanel -> Setup Node.js App**, edit your application and navigate to the **Environment variables** table. Add:

| Variable Name | Production Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/altair-academy?retryWrites=true&w=majority` | URL-encode password special characters |
| `AUTH_SECRET` | *(64-char random string)* | Generate with `openssl rand -hex 32` |
| `UPLOAD_DIR` | `/home/<cpanel-user>/altair-assets/uploads` | Must be absolute, outside app root |
| `PORT` | `3000` | Port Passenger assigns `[VERIFY]` |

Click **Save** and click **Restart Application**.

---

## Step 10: Verification & Smoke Testing Sequence

Run tests in this exact order:

1. **Health Check Probe**:
   Visit: `https://<your-domain>/api/health`
   Expected response: HTTP 200 `{ "ok": true }`.
2. **Public Website**:
   Visit: `https://<your-domain>/`
   Verify typography, CSS styling, header, footer, and seeded images.
3. **Course Catalog**:
   Visit: `https://<your-domain>/courses`
   Verify dynamic courses render from MongoDB Atlas with `/seed/...` cover images.
4. **Admin Dashboard Authentication**:
   Visit: `https://<your-domain>/admin/login`
   Log in with your seeded administrator credentials.
5. **Image Upload & Persistence Test**:
   - Go to **Courses** -> Edit a course.
   - Upload a new image (PNG, JPEG, or WebP under 5 MB).
   - Save the course.
   - Verify the image displays on both `/admin/courses` and the public `/courses/[slug]` page.
   - Inspect the image URL: it should start with `/uploads/courses/<uuid>.<ext>`.
6. **Restart Persistence Check**:
   - In cPanel, click **Restart** (or run `touch tmp/restart.txt` over SSH).
   - Refresh the page and confirm the uploaded image continues to display.
7. **Simulate Update Deploy**:
   - Deploying an updated package to `/home/<cpanel-user>/altair-app` must NOT delete files in `/home/<cpanel-user>/altair-assets/uploads`.

---

## Step 11: HTTPS, AutoSSL & Passenger .htaccess

GoDaddy cPanel provides free cPanel AutoSSL (powered by Sectigo or Let's Encrypt).

1. In cPanel, open **SSL/TLS Status** -> Click **Run AutoSSL** for your domain.
2. In cPanel **Domains**, toggle **Force HTTPS Redirect** to `On`.
3. > [!NOTE]
   > **Passenger .htaccess Integration `[VERIFY]`**:
   > When "Setup Node.js App" creates an app, it generates an `.htaccess` file in `public_html/` mapping incoming web traffic to the Passenger socket. If you add manual redirection rules to `.htaccess`, ensure the HTTPS redirect does not prevent Passenger rewrite rules:
   > ```apache
   > RewriteEngine On
   > RewriteCond %{HTTPS} !=on
   > RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   > ```

---

## Step 12: Routine Updates & Rollback Procedure

### Deploying Updates
1. Build the updated package locally or via GitHub: `npm run package:cpanel`.
2. In cPanel File Manager (or via SFTP), upload `deploy/altair-academy-cpanel.zip` to `/home/<cpanel-user>/altair-app/`.
3. Extract the archive, overwriting existing application files.
4. Uploaded media is stored safely in `/home/<cpanel-user>/altair-assets/uploads` and remains untouched.
5. In cPanel, click **Restart** (or over SSH: `touch /home/<cpanel-user>/altair-app/tmp/restart.txt`).

### Rollback
1. Keep the previous `.zip` archive (e.g., `altair-academy-cpanel-v1.0.0.zip`) in a backup directory on your local machine.
2. If an issue occurs, re-upload and extract the previous archive.
3. Restart the application.

---

## Step 13: Backups & Disaster Recovery

### 13.1 Database Backups (Atlas M0)
Atlas Free Tier (M0) does not include automated snapshot backups. Back up your data locally using `mongodump`:

**Backup Command (Run locally)**:
```bash
mongodump --uri="mongodb+srv://altair_app_user:<encoded-password>@<cluster>.mongodb.net/altair-academy" --out="./backups/$(date +%Y-%m-%d)"
```

**Restore Command**:
```bash
mongorestore --uri="mongodb+srv://altair_app_user:<encoded-password>@<cluster>.mongodb.net/altair-academy" --drop "./backups/YYYY-MM-DD/altair-academy"
```

### 13.2 Media Uploads Backup
> [!IMPORTANT]
> The `/home/<cpanel-user>/altair-assets/uploads` directory exists **only** on the GoDaddy server's disk. If the server experiences drive failure or account termination, all user-uploaded images are permanently lost without a backup.

**Backup via SSH / rsync (from your computer)**:
```bash
rsync -avz -e "ssh -p 22" <cpanel-user>@<server-ip>:/home/<cpanel-user>/altair-assets/uploads/ ./local-uploads-backup/
```
*(Alternatively: In cPanel File Manager, right-click `/home/<cpanel-user>/altair-assets/uploads`, click **Compress**, and download the zip archive).*

---

## Step 14: Optimizing Performance for Visitors in Asia

### 14.1 Latency Explanation
Your GoDaddy server and MongoDB Atlas cluster are physically located in Europe (~6,000+ miles from Singapore and Malaysia). A round-trip packet (RTT) between Southeast Asia and Western Europe takes **160ms–220ms**. 

Because dynamic pages currently use `export const dynamic = "force-dynamic"`, each HTML request travels from Asia to Europe, runs queries, and returns HTML, producing a minimum 300ms–600ms Time-To-First-Byte (TTFB).

### 14.2 Free Cloudflare CDN Setup
Placing Cloudflare's free global CDN in front of your GoDaddy domain caches static files and media close to visitors in Singapore, Kuala Lumpur, and Hong Kong:

1. **Sign up at [Cloudflare](https://www.cloudflare.com)** and add your domain.
2. **Update Nameservers**: Change nameservers at your domain registrar to Cloudflare's assigned nameservers.
3. **SSL/TLS Setting**: In Cloudflare dashboard -> **SSL/TLS**, select **Full (strict)**. (This requires GoDaddy's AutoSSL certificate to be active on the origin).
4. **Proxy Status**: In Cloudflare DNS, set the `@` and `www` records to **Proxied** (Orange Cloud).
5. **Cache Rules**:
   - Go to **Caching** -> **Cache Rules** -> **Create Rule**.
   - Rule 1 (Static Assets & Uploads):
     - When incoming request matches: `URI Path starts with "/_next/static/"` OR `URI Path starts with "/seed/"` OR `URI Path starts with "/uploads/"`
     - Cache eligibility: **Eligible for cache**
     - Edge TTL: **Respect origin headers** (1 year immutable)
   - Rule 2 (Admin Bypass):
     - When incoming request matches: `URI Path starts with "/admin"` OR `URI Path starts with "/api"`
     - Cache eligibility: **Bypass cache**
6. > [!NOTE]
   > **Compatibility `[VERIFY]`**: Cloudflare proxying works with Phusion Passenger provided SSL mode is set to "Full (strict)".

### 14.3 Future Architectural Recommendation: ISR & On-Demand Revalidation
To make Cloudflare or any CDN dramatically faster for visitors in Asia:
- Switch public pages from `export const dynamic = "force-dynamic"` to Incremental Static Regeneration (ISR) with `export const revalidate = 3600`.
- In admin mutation actions (`createCourse`, `updateCourse`, etc.), call `revalidatePath('/courses')`, `revalidatePath('/')`.
- **Result**: Cloudflare PoPs in Singapore and Kuala Lumpur can cache the generated HTML pages directly at the edge, serving page requests in **<25ms** without crossing continents to Europe.

---

## Step 15: Troubleshooting Reference

| Symptom / Error | Probable Cause | Actionable Solution |
| :--- | :--- | :--- |
| **500 Internal Server Error (Passenger)** | Unhandled startup crash or missing engine | Check passenger logs: `cat /home/<user>/logs/passenger.log` or `cat /home/<user>/altair-app/stderr.log` `[VERIFY]`. |
| **503 Service Unavailable on `/api/health`** | Atlas IP allowlist, bad credentials, or blocked port | Run `node tools/connectivity-check.mjs` over SSH to test port 27017. Verify outbound server IP (`curl -s https://ifconfig.me`). |
| **"Prisma Client could not locate the Query Engine"** | Missing Linux query engine binary | Verify `node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node` exists. Re-run `npm run package:cpanel`. |
| **Sharp platform error / `GLIBC` mismatch** | Windows sharp binary shipped to Linux | Ensure `@img/sharp-linux-x64` is in package. Build on Linux runner or via GitHub Actions workflow. |
| **Uploads fail with 413 or Request Entity Too Large** | Body size limit exceeded | App limit is set to 6 MB (`bodySizeLimit: "6mb"`). Check if Apache/Passenger has a lower `LimitRequestBody` configured `[VERIFY]`. |
| **Uploaded image returns 404** | Wrong `UPLOAD_DIR` or file permissions | Verify `UPLOAD_DIR` in cPanel matches actual path (`/home/<user>/altair-assets/uploads`). Run `chmod -R 755 /home/<user>/altair-assets`. |
| **Images disappear after deployment** | Uploads folder was inside app root | Ensure `UPLOAD_DIR` is strictly outside `/home/<user>/altair-app/`. |
| **Authentication Failed (Code 18) in MongoDB** | Special characters in password not encoded | URL-encode `@`, `:`, `#`, etc. in `DATABASE_URL` (e.g. `P%40ssword123`). |
| **Process killed (Out of Memory / Error 137)** | Exceeded cPanel account RAM limit `[VERIFY]` | Never run `next build` or `npm install` on the server. Always deploy prebuilt standalone packages. |

---

## Step 16: Hosting Limits & Upgrade Paths

1. **GoDaddy Web Hosting Deluxe Shared Limits `[VERIFY]`**:
   - Shared plans typically allocate between 512 MB and 1024 MB physical memory per cPanel account.
   - CPU is shared across multiple tenant accounts.
   - There is no persistent daemon guarantee; Passenger terminates inactive Node processes after idle timeout.
2. **When to Upgrade**:
   - If traffic spikes lead to memory kills (503 errors), upgrade to **GoDaddy Web Hosting Ultimate** or **GoDaddy VPS (Virtual Private Server)** with dedicated RAM and CPU.
3. **Important Portability Note**:
   - The server-disk image storage pattern (`UPLOAD_DIR`) requires a persistent, writable file system. It works on cPanel, VPS, and dedicated servers. It will **not** work on ephemeral serverless platforms (e.g., Netlify, Vercel, AWS Lambda) without configuring external persistent object storage (such as AWS S3 or Cloudflare R2).
