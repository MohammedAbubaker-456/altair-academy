# Local MongoDB Setup Guide (Native Replica Set — No Docker)

This guide walks you through installing and configuring MongoDB Community Server natively on your development machine as a single-node replica set (`rs0`).

---

## Why a Replica Set is Required

Prisma ORM uses MongoDB transactions under the hood for nested mutations, relation enforcement, and atomic updates. In MongoDB, transactions are **only supported on replica sets**, not standalone `mongod` instances. Connecting Prisma to a standalone MongoDB instance produces:

```
PrismaClientKnownRequestError: Transactions are not supported by this deployment
```

Configuring a single-node replica set locally enables full transaction support without needing multiple physical servers or Docker.

---

## 1. Operating System Installation

### A. Windows

1. **Download and Install MongoDB Community Server**:
   - Download the Windows `.msi` installer from the [MongoDB Community Download Center](https://www.mongodb.com/try/download/community).
   - Select **Complete** installation.
   - Select **"Install MongoD as a Service"** (runs as Network Service user).
   - Check **"Install MongoDB Compass"** if you want a visual GUI.
2. **Download and Install `mongosh` (MongoDB Shell)**:
   - Download the `.msi` from [MongoDB Shell Download](https://www.mongodb.com/try/download/shell) and complete the installer.
3. **Locate Configuration File**:
   - The default configuration file is at:
     ```
     C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
     ```
     _(Replace `7.0` with your installed version if different)._

---

### B. macOS (Homebrew)

1. **Tap the MongoDB Homebrew Formulae**:
   ```bash
   brew tap mongodb/brew
   ```
2. **Install MongoDB Community Server & Shell**:
   ```bash
   brew install mongodb-community@7.0 mongosh
   ```
3. **Locate Configuration File**:
   - **Apple Silicon (M1/M2/M3/M4)**:
     ```
     /opt/homebrew/etc/mongod.conf
     ```
   - **Intel Macs**:
     ```
     /usr/local/etc/mongod.conf
     ```

---

### C. Linux (Ubuntu / Debian)

1. **Import the Public Key & Repository**:
   ```bash
   sudo apt-get install gnupg curl
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   ```
2. **Install MongoDB & Shell**:
   ```bash
   sudo apt-get install -y mongodb-org
   ```
3. **Locate Configuration File**:
   ```
   /etc/mongod.conf
   ```

---

## 2. Enabling Replication in Configuration

Open your configuration file (`mongod.cfg` or `mongod.conf`) in a text editor with administrative / sudo privileges.

Add the following `replication` block:

```yaml
replication:
  replSetName: rs0
```

> [!IMPORTANT]
> **YAML Indentation Rule**: Use exactly **2 spaces** for indentation. Never use tabs (`\t`), as tabs cause YAML parsing errors that prevent the MongoDB service from starting.

Also ensure your `net` configuration binds to loopback:

```yaml
net:
  port: 27017
  bindIp: 127.0.0.1
```

Save and close the file.

---

## 3. Restarting the MongoDB Service

Apply the updated configuration by restarting the background service:

### Windows (Administrator Terminal)

Open PowerShell or Command Prompt **as Administrator**:

```powershell
net stop MongoDB
net start MongoDB
```

_(Alternatively: Open `services.msc`, locate "MongoDB Server", and click "Restart")._

### macOS

```bash
brew services restart mongodb-community@7.0
```

### Linux (Ubuntu / Debian)

```bash
sudo systemctl restart mongod
sudo systemctl status mongod
```

---

## 4. One-Time Replica Set Initialization

Open your terminal and launch `mongosh`:

```bash
mongosh
```

In the `mongosh` prompt, run the initialization command:

```javascript
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "127.0.0.1:27017" }],
});
```

You should see:

```json
{ "ok": 1 }
```

Within a few seconds, your shell prompt will change from `test>` to `rs0 [direct: primary] test>`, indicating that the replica set is active and this node is the writable primary.

### Why `127.0.0.1` and not `localhost`?

Modern operating systems and Node.js runtimes resolve `localhost` to either IPv6 (`::1`) or IPv4 (`127.0.0.1`). If the replica set member registers as `localhost:27017` and the Prisma connection pool attempts an IPv6 resolution, connection handshake mismatches or election timeouts occur. Binding explicitly to IPv4 loopback `127.0.0.1` eliminates all DNS ambiguity.

Exit `mongosh`:

```javascript
exit;
```

---

## 5. Project Environment Configuration

In your local project root, edit `.env`:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/altair-academy?replicaSet=rs0"
```

Verify your setup by running the health check script:

```bash
npm run db:check
```

If the replica set is properly configured, you will receive:

```
✔ MongoDB connection successful!
  Node: 127.0.0.1:27017
  Replica Set: rs0
  Status: Writable Primary
```

Then initialize your schema and seed data:

```bash
npm run db:push
npm run db:seed
```

---

## 6. Troubleshooting

### Issue: `MongoDB is running standalone; Prisma needs a replica set`

- **Cause**: The `replication` section in `mongod.conf` was omitted, misspelled, or the service was not restarted after editing.
- **Fix**: Open `mongod.conf`, verify `replication:\n  replSetName: rs0`, restart the MongoDB service, and run `rs.initiate(...)` in `mongosh`.

### Issue: MongoDB service fails to start after editing configuration

- **Cause**: YAML indentation error (most commonly using a tab instead of spaces).
- **Fix**: Review `mongod.conf` / `mongod.cfg`. Ensure all indentation is strictly 2 spaces. Check the service log:
  - Windows: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`
  - Linux: `/var/log/mongodb/mongod.log`
  - macOS: `/opt/homebrew/var/log/mongodb/mongo.log`

### Issue: `mongosh: command not found`

- **Cause**: The MongoDB Shell is packaged separately from the server starting in MongoDB v6+.
- **Fix**: Download and install `mongosh` from the official MongoDB Shell download page.

### Issue: `connect ECONNREFUSED 127.0.0.1:27017`

- **Cause**: The `mongod` service is not running or is bound to a different port.
- **Fix**: Check if the service is running (`sudo systemctl status mongod` on Linux, `brew services list` on macOS, or `Get-Service MongoDB` on Windows).

### Issue: Windows service restart fails with "Access is denied"

- **Cause**: Non-elevated command prompt.
- **Fix**: Right-click Terminal / PowerShell -> "Run as Administrator", then execute `net stop MongoDB && net start MongoDB`.

### Issue: Linux service crashes with Permission Denied on data directory

- **Cause**: Ownership of `/var/lib/mongodb` was altered.
- **Fix**: Run `sudo chown -R mongodb:mongodb /var/lib/mongodb /var/log/mongodb` and restart the service.
