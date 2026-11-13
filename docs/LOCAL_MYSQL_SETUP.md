# Local MariaDB / MySQL Setup Guide (XAMPP on Windows)

This guide walks you through setting up and verifying the local MariaDB database using XAMPP on Windows for Altair Academy.

---

## 1. Prerequisites and Installation

1. **Download and Install XAMPP**:
   - Download XAMPP for Windows (PHP 8.2+ / MariaDB 10.4 or 10.11) from [Apache Friends](https://www.apachefriends.org/).
   - Install to the default directory: `C:\xampp`.
   - Ensure the MySQL component is checked during installation.

2. **Start MariaDB in XAMPP Control Panel**:
   - Open `xampp-control.exe` (run as Administrator if registering as a service).
   - Click **Start** next to **MySQL**.
   - Verify the port is `3306` and the status turns green.

---

## 2. Server Configuration (`my.ini`)

To ensure data integrity, standard SQL compliance, and consistency with production GoDaddy MariaDB 10.11:

1. Open `C:\xampp\mysql\bin\my.ini` in a text editor (e.g. VS Code or Notepad).
2. Locate the `[mysqld]` section.
3. Verify or add the following settings:

```ini
[mysqld]
# Ensure strict mode is enabled
sql_mode=STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION

# Ensure adequate packet size for rich text, JSON, and base64 uploads
max_allowed_packet=64M

# Default character set and collation
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
```

4. Locate the `[client]` and `[mysql]` sections and ensure:

```ini
[client]
default-character-set=utf8mb4
max_allowed_packet=64M

[mysql]
default-character-set=utf8mb4
```

5. Save `my.ini` and **Restart MySQL** in the XAMPP Control Panel (Stop, then Start).

---

## 3. Database Creation

Open PowerShell or Command Prompt and create the local databases using XAMPP's MySQL client:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "
CREATE DATABASE IF NOT EXISTS altair_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS altair_importtest CHARACTER SET latin1 COLLATE latin1_swedish_ci;
"
```

- **`altair_academy`**: The primary local database for development, using `utf8mb4` and `utf8mb4_unicode_ci`.
- **`altair_importtest`**: A staging database created with default `latin1` (imitating GoDaddy cPanel's server-level default) to test and verify dump imports.

---

## 4. Environment Variables (`.env`)

Configure your `.env` file with the MySQL connection string:

```env
# Local XAMPP MariaDB (root with empty password on 127.0.0.1:3306)
DATABASE_URL="mysql://root@127.0.0.1:3306/altair_academy"

# Read-only source MongoDB connection (used only for initial migration)
MONGO_SOURCE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/altair?retryWrites=true&w=majority"
```

_Note: If you configured a password for MySQL `root`, URL-encode any special characters in the password._

---

## 5. Verification Commands

To verify your configuration at any time, run:

```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root -e "
SELECT VERSION(), @@sql_mode, @@character_set_server, @@collation_server, @@lower_case_table_names, @@max_allowed_packet;
SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME IN ('altair_academy', 'altair_importtest');
"
```

Expected output:

- `VERSION()`: `10.11.x-MariaDB` (or `10.4.x-MariaDB`)
- `@@sql_mode`: Contains `STRICT_TRANS_TABLES`
- `altair_academy`: `utf8mb4` / `utf8mb4_unicode_ci`
- `altair_importtest`: `latin1` / `latin1_swedish_ci`
