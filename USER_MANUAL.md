# User Manual — KeyPass-SQE

**For:** Abdul Wadood (24i-3055)  
**Project:** SE3002 Assignment 01 — KeePass Password Safe

---

## What Is This Project?

This is a **web-based password manager** inspired by the original KeePass Password Safe desktop application. It's built for our SE3002 Software Quality Engineering assignment to demonstrate:

- Requirements traceability (7 FRs + 3 NFRs from the SRS)
- Test documentation (12-15 test cases)
- Static analysis (SonarQube)
- Defect tracking (Jira)

**Tech Stack:** React + TypeScript (frontend) | Node.js + Express + TypeScript (backend) | SQLite (database)

---

## Quick Start

### 1. Install Dependencies

```bash
# From the project root
cd keepass-sqe

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Run the Application

Open **two terminals** in the `keepass-sqe` directory:

```bash
# Terminal 1 — Backend Server
cd server && npm run dev

# Terminal 2 — Frontend App
cd client && npm run dev
```

### 3. Open in Browser

Go to: **http://localhost:5173**

---

## How to Use the Application

### Step 1: Create a New Database

1. Click **"➕ New Database"**
2. Enter a database name (e.g., "MyPasswords")
3. Enter a master password (this unlocks your database)
4. Confirm the password
5. Click **"Create"**

**What's happening (REQ-1 to REQ-4):**
- A new encrypted database is created
- Your password is used to derive an encryption key via SHA-256
- The database is encrypted with AES-256-GCM

### Step 2: Unlock the Database

After creating, you'll see the unlock screen:

1. Enter your master password
2. Click **"Unlock"**

**Important SRS Rules:**
- REQ-27: If you lose your password, there is **no recovery**
- REQ-28: There is **no backdoor** — we cannot recover your data

### Step 3: Create Groups (FR2)

Groups organize your passwords into folders:

1. Click **"➕"** next to "Groups" in the sidebar
2. Enter a group name (REQ-7: name is required)
3. Click **"Add"**

**To create a subgroup:**
1. Hover over a group
2. Click the **"➕"** button that appears
3. Enter the subgroup name

**To rename:** Hover → Click ✏️ → Enter new name → Save  
**To delete:** Hover → Click 🗑️ → Confirm

### Step 4: Add Password Entries (FR3)

1. Select a group in the sidebar
2. Click **"➕ Add Entry"** in the top bar
3. Fill in the fields:
   - **Title** (required for identification)
   - **Username**
   - **Password** (REQ-12, REQ-13: must match confirmation)
   - **URL**
   - **Notes**
4. Click **"Save"**

**SRS Note (REQ-14):** Entries can have empty fields — the SRS explicitly allows this.

**To duplicate:** Click the 📋 icon next to any entry  
**To delete:** Click the 🗑️ icon → Confirm

### Step 5: Use the Password Generator (FR5)

1. Click **"🎲 Generator"** in the top bar
2. Adjust settings:
   - **Length:** Drag the slider (1-128 characters)
   - **Character sets:** Check/uncheck uppercase, lowercase, digits, special
3. Click **"🔄 Generate"**
4. Click **"📋 Use This Password"** to copy to entry form

**SRS Note:** Setting length to 0 disables the generator (Section 3.20).

### Step 6: Auto-Type Configuration (FR6)

When editing an entry, you'll see the Auto-Type section:

- The sequence is automatically added to the notes field
- Default: `{USERNAME}{TAB}{PASSWORD}{ENTER}`
- REQ-19: Must start with "Auto-Type:" prefix
- REQ-20: Maximum 59 characters (counter shows remaining)
- REQ-21: If two Auto-Type lines exist, only the first is used

### Step 7: Create and Use TANs (FR7)

TANs (Transaction Authentication Numbers) are one-time codes:

1. Select a group
2. Click **"🔑 Create TANs"**
3. Enter how many TANs to create (default: 10)
4. Click **"Create X TANs"**

**Using a TAN:**
- TANs appear in the entry list with a 🔑 icon
- Click **"✓ Use TAN"** to mark it as used
- REQ-33: Once used, a TAN **expires permanently** and cannot be used again

### Step 8: Clipboard Security (NFR2)

When you copy a password:
- A warning appears: "⏱️ Password copied! Auto-clears in Xs"
- The timer counts down from 10 seconds
- After 10 seconds, the clipboard is **automatically cleared**

---

## API Endpoints (For Testing)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/database/new` | Create new database |
| POST | `/api/database/open` | Open existing database |
| POST | `/api/groups/add` | Create group |
| PUT | `/api/groups/rename` | Rename group |
| DELETE | `/api/groups/:id` | Delete group |
| POST | `/api/entries/add` | Create entry |
| PUT | `/api/entries/update` | Update entry |
| POST | `/api/entries/duplicate` | Duplicate entry |
| DELETE | `/api/entries/:id` | Delete entry |
| POST | `/api/auth/login` | Authenticate |
| POST | `/api/generator/generate` | Generate password |
| POST | `/api/tan/create` | Create TANs |
| POST | `/api/tan/use` | Mark TAN as used |

---

## Key SRS Rules to Remember

| Rule | Description | Where to Test |
|------|-------------|---------------|
| REQ-7 | Group name is required | Create group without name |
| REQ-8 | Subgroup requires parent group | Try creating subgroup without selecting parent |
| REQ-11 | Entry must belong to group | Try creating entry without selecting group |
| REQ-12 | Password confirmation required | Enter mismatched passwords |
| REQ-20 | Auto-Type max 59 chars | Type 60+ characters in Auto-Type |
| REQ-21 | First Auto-Type wins | Add two Auto-Type lines to notes |
| REQ-26 | Composite key = BOTH | Enable key file, try logging in without it |
| REQ-33 | TAN expires permanently | Use a TAN, try to use it again |
| NFR2 | 10-second clipboard | Copy password, wait 10s, try to paste |

---

## Running Tests

```bash
# Server tests
cd server && npm test

# Client tests  
cd client && npm test
```

---

## File Structure

```
keepass-sqe/
├── client/src/
│   ├── components/
│   │   ├── DatabaseManager.tsx   # New/Open dialogs
│   │   ├── AuthDialog.tsx        # Master key entry
│   │   ├── GroupTree.tsx         # Group sidebar
│   │   ├── EntryList.tsx         # Entry table
│   │   ├── EntryForm.tsx         # Add/Edit entry
│   │   ├── PasswordGenerator.tsx # Random password tool
│   │   ├── AutoTypeConfig.tsx    # Auto-Type editor
│   │   ├── TanWizard.tsx         # TAN creation
│   │   └── TanEntry.tsx          # TAN display
│   └── hooks/
│       ├── useClipboard.ts       # 10s clipboard timer
│       └── useDatabase.ts        # State management
├── server/src/
│   ├── routes/
│   │   ├── database.ts           # FR1 endpoints
│   │   ├── groups.ts             # FR2 endpoints
│   │   ├── entries.ts            # FR3 endpoints
│   │   ├── auth.ts               # FR4 endpoints
│   │   ├── generator.ts          # FR5 endpoints
│   │   └── tan.ts                # FR7 endpoints
│   ├── crypto/
│   │   ├── encrypt.ts            # AES-256-GCM
│   │   ├── keyDerivation.ts      # SHA-256
│   │   └── keyFile.ts            # Key file handling
│   └── db/
│       └── schema.ts             # SQLite tables
└── shared/
    └── types.ts                  # TypeScript interfaces
```

---

## Common Issues

**"Database not found" error:**
- Make sure the server is running on port 3001
- Check that the database ID is correct

**"Invalid master key" error:**
- Double-check your password
- Remember: REQ-27 — no recovery for lost passwords

**Clipboard not clearing:**
- Some browsers block clipboard API
- The timer uses `navigator.clipboard.writeText()`
- Works best in Chrome/Edge

---

## Contact

If you have questions, ask Ali or check the IMPLEMENTATION_PLAN.md for detailed task breakdown.
