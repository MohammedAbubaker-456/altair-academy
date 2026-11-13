# GoDaddy cPanel MariaDB Import Guide (via phpMyAdmin)

This guide walks you through importing the Altair Academy MariaDB database dump (`altair_academy_full.sql`) into your GoDaddy cPanel MariaDB database using phpMyAdmin.

---

## 1. Overview & Compatibility

- **Target Engine**: MariaDB 10.11.x (GoDaddy Web Hosting Deluxe / CloudLinux).
- **Server Default Charset**: `latin1` (cp1252) — this is standard on GoDaddy cPanel.
- **Table Encoding**: `utf8mb4` / `utf8mb4_unicode_ci`.
- **Dump File**: `db-dumps/altair_academy_full.sql` (~193 KB).
- **phpMyAdmin Upload Limit**: Default 50 MiB (the dump is ~0.2 MiB and imports in seconds).
- **Isolation Guarantee**: The dump contains **NO** `CREATE DATABASE` or `USE` statements. It will strictly populate the selected database and will never touch or affect any other database on your hosting account.

---

## 2. Step-by-Step phpMyAdmin Import

### Step 1: Open phpMyAdmin
1. Log into your **GoDaddy Account** and navigate to your **cPanel**.
2. Under the **Databases** section, click **phpMyAdmin**.

### Step 2: Select Your Target Database
1. In the left navigation sidebar of phpMyAdmin, click on your Altair Academy database (e.g., `cpuser_altair_db`).
   > **Important**: Ensure you have selected the database itself, so that the breadcrumb at the top reads: `Server: localhost >> Database: cpuser_altair_db`.

### Step 3: Open the Import Tab
1. Click the **Import** tab on the top navigation bar.

### Step 4: Choose the Dump File
1. Under **File to import**, click **Choose File** (or **Browse**).
2. Select `altair_academy_full.sql` from your local `db-dumps/` folder.
3. Verify **Character set of the file** is set to `utf-8` (default).

### Step 5: Execute the Import
1. Leave the remaining settings at their defaults:
   - Partial import: Checked
   - Format: **SQL**
   - SQL compatibility mode: **NONE**
2. Scroll to the bottom and click **Import** (or **Go**).
3. Wait a few seconds until you see the green success banner:
   ```
   Import has been successfully finished, XXX queries executed.
   ```

---

## 3. Post-Import Verification

In phpMyAdmin, click the **SQL** tab and run the following queries to verify row counts and table collations:

```sql
-- 1. Verify total table collations (all must be utf8mb4_unicode_ci)
SELECT TABLE_NAME, TABLE_COLLATION 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE();

-- 2. Verify primary data counts
SELECT 'courses' AS table_name, COUNT(*) AS count FROM courses
UNION ALL
SELECT 'calendar_sessions', COUNT(*) FROM calendar_sessions
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'news_posts', COUNT(*) FROM news_posts
UNION ALL
SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL
SELECT 'upcoming_intakes', COUNT(*) FROM upcoming_intakes
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;
```

### Expected Row Counts:
- `courses`: **69**
- `calendar_sessions`: **38**
- `categories`: **9**
- `subcategories`: **11**
- `team_members`: **7**
- `news_posts`: **11**
- `testimonials`: **9**
- `upcoming_intakes`: **4**
- `admin_users`: **1**

---

## 4. Connecting the Next.js App in cPanel

In your cPanel **"Setup Node.js App"** management screen, set the `DATABASE_URL` environment variable:

```env
DATABASE_URL="mysql://<db_user>:<url_encoded_password>@localhost:3306/<db_name>"
```

- **Host**: `localhost` (or `127.0.0.1`)
- **Port**: `3306`
- **Password**: If your database user password contains special characters (e.g. `@`, `:`, `/`, `?`, `#`), they **must** be URL-encoded (e.g. `@` becomes `%40`).

After setting the variable, click **Save** and **Restart** the application.
