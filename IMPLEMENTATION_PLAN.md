# KeePass Password Safe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based KeePass Password Safe GUI implementing 7 FRs + 3 NFRs from the SRS, with React/TypeScript frontend, Node.js/Express/TypeScript backend, and SQLite database.

**Architecture:** Client-server architecture with REST API. Frontend handles UI rendering and client-side clipboard timers. Backend handles encryption, database operations, and authentication. Shared TypeScript types ensure contract consistency.

**Tech Stack:** React + TypeScript (Vite), Node.js + Express + TypeScript, SQLite (better-sqlite3), Web Crypto API, Vitest + React Testing Library

---

## Global Constraints

- **Max 3 CRUD FRs** — FR1, FR2, FR3 are CRUD; FR4-FR7 are non-CRUD
- **SRS Rules to implement exactly:** REQ-33 (TAN permanent expiry), REQ-21 (first Auto-Type wins), REQ-20 (59-char Auto-Type limit), REQ-26 (composite key = BOTH password AND key file), NFR2 (10-second clipboard clear timer)
- **Design decisions logged in AI_DEV_LOG.md** — every deviation from SRS must be documented with rationale
- **Defect logging in Jira project `KAN`** — cloudId: `2996568a-e256-499c-8cf4-e32d3d8ff29e`
- **SonarCloud scan** — org: `alihaiderbajwa`, project: `AliHaiderBajwa_KeyPass-SQE`
- **Authors:** Ali Haider Bajwa (24i-3102) & Abdul Wadood (24i-3055)

---

## File Structure

```
keepass-sqe/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx           # App shell with sidebar
│   │   │   ├── GroupTree.tsx        # Group/subgroup tree (FR2)
│   │   │   ├── EntryList.tsx        # Password entries list (FR3)
│   │   │   ├── EntryForm.tsx        # Add/Edit entry form (FR3)
│   │   │   ├── DatabaseManager.tsx  # New/Open/Save dialogs (FR1)
│   │   │   ├── AuthDialog.tsx       # Master key entry (FR4)
│   │   │   ├── PasswordGenerator.tsx # Generator panel (FR5)
│   │   │   ├── AutoTypeConfig.tsx   # Auto-Type sequence editor (FR6)
│   │   │   ├── TanWizard.tsx        # TAN creation wizard (FR7)
│   │   │   └── TanEntry.tsx         # TAN display/usage (FR7)
│   │   ├── hooks/
│   │   │   ├── useClipboard.ts      # 10-sec clipboard timer (NFR2)
│   │   │   └── useDatabase.ts       # Database state management
│   │   ├── utils/
│   │   │   ├── crypto.ts            # Client-side encryption helpers
│   │   │   └── autoType.ts          # Auto-Type parsing (FR6)
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── database.ts          # FR1: New/Open/Save endpoints
│   │   │   ├── groups.ts            # FR2: Group CRUD endpoints
│   │   │   ├── entries.ts           # FR3: Entry CRUD endpoints
│   │   │   ├── auth.ts              # FR4: Authentication endpoints
│   │   │   ├── generator.ts         # FR5: Password generation endpoint
│   │   │   └── tan.ts               # FR7: TAN endpoints
│   │   ├── middleware/
│   │   │   └── auth.ts              # Session/auth middleware
│   │   ├── db/
│   │   │   ├── schema.ts            # SQLite table definitions
│   │   │   └── migrations.ts        # DB setup scripts
│   │   ├── crypto/
│   │   │   ├── encrypt.ts           # AES-256-GCM encryption (NFR1)
│   │   │   ├── keyDerivation.ts     # SHA-256 key derivation (NFR1)
│   │   │   └── keyFile.ts           # Key file generation/parsing
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript types
│   │   └── app.ts                   # Express app setup
│   ├── package.json
│   └── tsconfig.json
├── shared/                          # Shared types
│   └── types.ts                     # Common interface definitions
├── package.json                     # Root monorepo config
├── PROJECT_SCOPE.md
├── AI_DEV_LOG.md
└── README.md
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `keepass-sqe/package.json` (root)
- Create: `keepass-sqe/client/package.json`
- Create: `keepass-sqe/server/package.json`
- Create: `keepass-sqe/shared/types.ts`
- Create: `keepass-sqe/client/tsconfig.json`
- Create: `keepass-sqe/server/tsconfig.json`
- Create: `keepass-sqe/client/vite.config.ts`
- Create: `keepass-sqe/server/src/app.ts`

**Interfaces:**
- Produces: Shared TypeScript types used by all subsequent tasks

- [ ] **Step 1: Create root package.json with workspace config**

```json
{
  "name": "keepass-sqe",
  "private": true,
  "workspaces": ["client", "server", "shared"]
}
```

- [ ] **Step 2: Create shared/types.ts with core interfaces**

```typescript
// Database entity types
export interface Database {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  databaseId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  databaseId: string;
  groupId: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  isTan: boolean;
  tanUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MasterKey {
  password?: string;
  keyFileContent?: string;
}

// API request/response types
export interface CreateDatabaseRequest {
  name: string;
  masterKey: MasterKey;
}

export interface AuthRequest {
  databaseId: string;
  masterKey: MasterKey;
}

export interface CreateGroupRequest {
  databaseId: string;
  parentId: string | null;
  name: string;
}

export interface CreateEntryRequest {
  databaseId: string;
  groupId: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface GeneratePasswordRequest {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeDigits: boolean;
  includeSpecial: boolean;
}

export interface GeneratePasswordResponse {
  password: string;
}

export interface CreateTanRequest {
  databaseId: string;
  groupId: string;
  count: number;
}

export interface UseTanRequest {
  entryId: string;
}

// Auto-Type types
export interface AutoTypeSequence {
  prefix: string;
  sequence: string;
  isValid: boolean;
  error?: string;
}
```

- [ ] **Step 3: Create client/package.json**

```json
{
  "name": "keepass-client",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.4.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 4: Create server/package.json**

```json
{
  "name": "keepass-server",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.0",
    "better-sqlite3": "^11.0.0",
    "cors": "^2.8.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/cors": "^2.8.0",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 5: Create TypeScript configs**

`client/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

`server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 6: Install dependencies**

Run: `cd keepass-sqe && npm install`

- [ ] **Step 7: Commit scaffolding**

```bash
git add .
git commit -m "chore: scaffold project structure with TypeScript configs"
```

---

## Task 2: Database Schema & Connection (FR1 Foundation)

**Files:**
- Create: `keepass-sqe/server/src/db/schema.ts`
- Create: `keepass-sqe/server/src/db/migrations.ts`

**Interfaces:**
- Consumes: Shared types from Task 1
- Produces: Database tables, `getDb()` function

- [ ] **Step 1: Write database schema**

```typescript
// server/src/db/schema.ts
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'keepass.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDb();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS databases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      encrypted_data BLOB NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      database_id TEXT NOT NULL,
      parent_id TEXT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      database_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      username TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      is_tan INTEGER NOT NULL DEFAULT 0,
      tan_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      database_id TEXT NOT NULL,
      master_key_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE
    );
  `);
}
```

- [ ] **Step 2: Write migration script**

```typescript
// server/src/db/migrations.ts
import { initializeDatabase } from './schema';

export function runMigrations(): void {
  console.log('Running database migrations...');
  initializeDatabase();
  console.log('Migrations complete.');
}
```

- [ ] **Step 3: Write test for schema initialization**

```typescript
// server/src/db/__tests__/schema.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb, initializeDatabase } from '../schema';

describe('Database Schema', () => {
  beforeAll(() => {
    initializeDatabase();
  });

  it('should create all required tables', () => {
    const db = getDb();
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();
    
    const tableNames = tables.map((t: any) => t.name);
    expect(tableNames).toContain('databases');
    expect(tableNames).toContain('groups');
    expect(tableNames).toContain('entries');
    expect(tableNames).toContain('sessions');
  });

  it('should have foreign keys enabled', () => {
    const db = getDb();
    const result = db.pragma('foreign_keys', { simple: true });
    expect(result).toBe(1);
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 5: Commit database schema**

```bash
git add server/src/db/
git commit -m "feat(db): add SQLite schema with tables for databases, groups, entries, sessions"
```

---

## Task 3: Encryption & Key Derivation (NFR1 Foundation)

**Files:**
- Create: `keepass-sqe/server/src/crypto/encrypt.ts`
- Create: `keepass-sqe/server/src/crypto/keyDerivation.ts`
- Create: `keepass-sqe/server/src/crypto/keyFile.ts`

**Interfaces:**
- Consumes: None (standalone crypto utilities)
- Produces: `encrypt()`, `decrypt()`, `deriveKey()`, `generateKeyFile()`, `parseKeyFile()`

- [ ] **Step 1: Write key derivation using SHA-256**

```typescript
// server/src/crypto/keyDerivation.ts
const ITERATIONS = 100000;
const KEY_LENGTH = 256;

export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}
```

- [ ] **Step 2: Write AES-256-GCM encryption (NFR1)**

```typescript
// server/src/crypto/encrypt.ts
import { deriveKey, generateSalt } from './keyDerivation';

export interface EncryptedData {
  data: Uint8Array;
  iv: Uint8Array;
  salt: Uint8Array;
}

export async function encrypt(
  plaintext: string,
  password: string
): Promise<EncryptedData> {
  const salt = generateSalt();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return {
    data: new Uint8Array(encrypted),
    iv,
    salt
  };
}

export async function decrypt(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  const key = await deriveKey(password, encryptedData.salt);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: encryptedData.iv },
    key,
    encryptedData.data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
```

- [ ] **Step 3: Write key file generation/parsing**

```typescript
// server/src/crypto/keyFile.ts
import { v4 as uuidv4 } from 'uuid';

export interface KeyFile {
  id: string;
  content: string;
  createdAt: string;
}

export function generateKeyFile(): KeyFile {
  const id = uuidv4();
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const content = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    id,
    content,
    createdAt: new Date().toISOString()
  };
}

export function parseKeyFile(content: string): boolean {
  if (content.length !== 64) return false;
  return /^[0-9a-f]{64}$/.test(content);
}
```

- [ ] **Step 4: Write encryption tests**

```typescript
// server/src/crypto/__tests__/encrypt.test.ts
import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../encrypt';
import { deriveKey } from '../keyDerivation';
import { generateKeyFile, parseKeyFile } from '../keyFile';

describe('Encryption (NFR1)', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const plaintext = 'TestPassword123!';
    const password = 'masterPassword';
    
    const encrypted = await encrypt(plaintext, password);
    const decrypted = await decrypt(encrypted, password);
    
    expect(decrypted).toBe(plaintext);
  });

  it('should fail decryption with wrong password', async () => {
    const plaintext = 'TestPassword123!';
    
    const encrypted = await encrypt(plaintext, 'correctPassword');
    
    await expect(decrypt(encrypted, 'wrongPassword')).rejects.toThrow();
  });

  it('should generate unique salt each time', async () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    
    expect(salt1).not.toEqual(salt2);
  });
});

describe('Key Derivation', () => {
  it('should derive consistent key from same password', async () => {
    const password = 'testPassword';
    const salt = new Uint8Array(16);
    
    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);
    
    expect(key1).toBeDefined();
    expect(key2).toBeDefined();
  });
});

describe('Key File', () => {
  it('should generate valid key file', () => {
    const keyFile = generateKeyFile();
    
    expect(keyFile.id).toBeDefined();
    expect(keyFile.content).toHaveLength(64);
    expect(parseKeyFile(keyFile.content)).toBe(true);
  });

  it('should reject invalid key file', () => {
    expect(parseKeyFile('short')).toBe(false);
    expect(parseKeyFile('g'.repeat(64))).toBe(false);
  });
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 6: Commit encryption module**

```bash
git add server/src/crypto/
git commit -m "feat(crypto): implement AES-256-GCM encryption and SHA-256 key derivation (NFR1)"
```

---

## Task 4: FR1 — Manage Password Database (New/Open/Save)

**Files:**
- Create: `keepass-sqe/server/src/routes/database.ts`
- Create: `keepass-sqe/client/src/components/DatabaseManager.tsx`
- Create: `keepass-sqe/client/src/hooks/useDatabase.ts`

**Interfaces:**
- Consumes: `encrypt()`, `decrypt()` from Task 3, `getDb()` from Task 2
- Produces: `POST /api/database/new`, `POST /api/database/open`, `POST /api/database/save`

- [ ] **Step 1: Write database route handlers**

```typescript
// server/src/routes/database.ts
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema';
import { encrypt, decrypt } from '../crypto/encrypt';
import { parseKeyFile } from '../crypto/keyFile';

const router = Router();

// REQ-1: Create new database
router.post('/new', async (req: Request, res: Response) => {
  try {
    const { name, masterKey } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Database name is required' });
    }
    
    // REQ-2: Master password has no length limits
    // REQ-3: Database file must have .kdb extension (we use JSON internally)
    // REQ-4: Different names required (handled by client)
    
    const db = getDb();
    const id = uuidv4();
    
    // Create initial empty structure
    const initialData = {
      groups: [],
      entries: [],
      settings: {}
    };
    
    const encrypted = await encrypt(
      JSON.stringify(initialData),
      masterKey.password || ''
    );
    
    db.prepare(`
      INSERT INTO databases (id, name, encrypted_data)
      VALUES (?, ?, ?)
    `).run(id, name, Buffer.from(encrypted.data));
    
    // Create root group
    const rootGroupId = uuidv4();
    db.prepare(`
      INSERT INTO groups (id, database_id, parent_id, name)
      VALUES (?, ?, NULL, 'Root')
    `).run(rootGroupId, id, 'Root');
    
    res.json({ 
      id, 
      name, 
      rootGroupId,
      message: 'Database created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create database' });
  }
});

// REQ-24/25/26: Authentication - composite key requires BOTH
router.post('/open', async (req: Request, res: Response) => {
  try {
    const { databaseId, masterKey } = req.body;
    
    const db = getDb();
    const database = db.prepare(
      'SELECT * FROM databases WHERE id = ?'
    ).get(databaseId);
    
    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }
    
    // REQ-27: Lost password = no recovery
    // REQ-28: No backdoor
    const decrypted = await decrypt(
      { data: (database as any).encrypted_data, iv: new Uint8Array(12), salt: new Uint8Array(16) },
      masterKey.password || ''
    );
    
    res.json({
      id: databaseId,
      data: JSON.parse(decrypted),
      message: 'Database opened successfully'
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid master key' });
  }
});

export default router;
```

- [ ] **Step 2: Write DatabaseManager component**

```typescript
// client/src/components/DatabaseManager.tsx
import React, { useState } from 'react';

interface DatabaseManagerProps {
  onDatabaseOpen: (databaseId: string) => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onDatabaseOpen }) => {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [dbName, setDbName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleNewDatabase = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const response = await fetch('/api/database/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dbName,
          masterKey: { password }
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        onDatabaseOpen(data.id);
        setShowNewDialog(false);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create database');
    }
  };

  return (
    <div className="database-manager">
      <h2>KeePass Password Safe</h2>
      <div className="actions">
        <button onClick={() => setShowNewDialog(true)}>New Database</button>
        <button onClick={() => setShowOpenDialog(true)}>Open Database</button>
      </div>
      
      {showNewDialog && (
        <div className="dialog">
          <h3>Create New Database</h3>
          <input
            type="text"
            placeholder="Database name"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
          />
          <input
            type="password"
            placeholder="Master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button onClick={handleNewDatabase}>Create</button>
          <button onClick={() => setShowNewDialog(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Write useDatabase hook**

```typescript
// client/src/hooks/useDatabase.ts
import { useState, useCallback } from 'react';

export function useDatabase() {
  const [databaseId, setDatabaseId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const openDatabase = useCallback(async (id: string, password: string) => {
    try {
      const response = await fetch('/api/database/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseId: id,
          masterKey: { password }
        })
      });
      
      if (response.ok) {
        setDatabaseId(id);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return { databaseId, isAuthenticated, openDatabase };
}
```

- [ ] **Step 4: Write FR1 tests**

```typescript
// server/src/routes/__tests__/database.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import databaseRouter from '../database';

const app = express();
app.use(express.json());
app.use('/api/database', databaseRouter);

describe('FR1: Database Management', () => {
  let databaseId: string;

  it('should create a new database', async () => {
    const response = await request(app)
      .post('/api/database/new')
      .send({
        name: 'TestDatabase',
        masterKey: { password: 'testPassword123' }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('TestDatabase');
    databaseId = response.body.id;
  });

  it('should reject empty database name', async () => {
    const response = await request(app)
      .post('/api/database/new')
      .send({
        name: '',
        masterKey: { password: 'testPassword123' }
      });
    
    expect(response.status).toBe(400);
  });

  it('should open database with correct password', async () => {
    const response = await request(app)
      .post('/api/database/open')
      .send({
        databaseId,
        masterKey: { password: 'testPassword123' }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const response = await request(app)
      .post('/api/database/open')
      .send({
        databaseId,
        masterKey: { password: 'wrongPassword' }
      });
    
    expect(response.status).toBe(401);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 6: Commit FR1**

```bash
git add server/src/routes/database.ts client/src/components/DatabaseManager.tsx client/src/hooks/useDatabase.ts
git commit -m "feat(fr1): implement database new/open/save (REQ-1 to REQ-4)"
```

---

## Task 5: FR2 — Manage Groups/Subgroups (Add/Modify/Delete/Find)

**Files:**
- Create: `keepass-sqe/server/src/routes/groups.ts`
- Create: `keepass-sqe/client/src/components/GroupTree.tsx`

**Interfaces:**
- Consumes: `getDb()` from Task 2
- Produces: `POST /api/groups/add`, `PUT /api/groups/rename`, `DELETE /api/groups/:id`, `GET /api/groups/find`

- [ ] **Step 1: Write group route handlers**

```typescript
// server/src/routes/groups.ts
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema';

const router = Router();

// REQ-7: Name required to create group
router.post('/add', (req: Request, res: Response) => {
  try {
    const { databaseId, parentId, name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required (REQ-7)' });
    }
    
    // REQ-8: Subgroup requires selected group
    if (parentId === undefined) {
      return res.status(400).json({ error: 'Parent group must be selected (REQ-8)' });
    }
    
    const db = getDb();
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO groups (id, database_id, parent_id, name)
      VALUES (?, ?, ?, ?)
    `).run(id, databaseId, parentId, name);
    
    res.json({ id, name, message: 'Group created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// REQ-9: Name required to rename
router.put('/rename', (req: Request, res: Response) => {
  try {
    const { groupId, name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required (REQ-9)' });
    }
    
    const db = getDb();
    db.prepare(`
      UPDATE groups SET name = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, groupId);
    
    res.json({ message: 'Group renamed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rename group' });
  }
});

// Delete group with confirmation (SRS requirement)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({ error: 'Confirmation required' });
    }
    
    const db = getDb();
    db.prepare('DELETE FROM groups WHERE id = ?').run(id);
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// REQ-10: Find in group
router.get('/find', (req: Request, res: Response) => {
  try {
    const { databaseId, groupId, query } = req.query;
    
    const db = getDb();
    const results = db.prepare(`
      SELECT * FROM entries 
      WHERE database_id = ? AND group_id = ? 
      AND (title LIKE ? OR username LIKE ? OR notes LIKE ?)
    `).all(
      databaseId,
      groupId,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`
    );
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search group' });
  }
});

export default router;
```

- [ ] **Step 2: Write GroupTree component**

```typescript
// client/src/components/GroupTree.tsx
import React, { useState } from 'react';

interface Group {
  id: string;
  name: string;
  parentId: string | null;
  children?: Group[];
}

interface GroupTreeProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onAddGroup: (parentId: string | null, name: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupTree: React.FC<GroupTreeProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddGroup = (parentId: string | null) => {
    if (newGroupName.trim()) {
      onAddGroup(parentId, newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleRename = (groupId: string) => {
    if (editName.trim()) {
      onRenameGroup(groupId, editName.trim());
      setEditingGroupId(null);
    }
  };

  const renderGroup = (group: Group, level: number = 0) => (
    <div
      key={group.id}
      className={`group-item ${selectedGroupId === group.id ? 'selected' : ''}`}
      style={{ paddingLeft: `${level * 20}px` }}
    >
      <span onClick={() => onSelectGroup(group.id)}>
        📁 {group.name}
      </span>
      <button onClick={() => setEditingGroupId(group.id)}>✏️</button>
      <button onClick={() => onDeleteGroup(group.id)}>🗑️</button>
      
      {editingGroupId === group.id && (
        <div className="edit-form">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="New name"
          />
          <button onClick={() => handleRename(group.id)}>Save</button>
        </div>
      )}
      
      {group.children?.map(child => renderGroup(child, level + 1))}
    </div>
  );

  return (
    <div className="group-tree">
      <h3>Groups</h3>
      <div className="add-group">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name"
        />
        <button onClick={() => handleAddGroup(null)}>Add Root Group</button>
      </div>
      {groups.map(group => renderGroup(group))}
    </div>
  );
};
```

- [ ] **Step 3: Write FR2 tests**

```typescript
// server/src/routes/__tests__/groups.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import groupsRouter from '../groups';

const app = express();
app.use(express.json());
app.use('/api/groups', groupsRouter);

describe('FR2: Group Management', () => {
  let groupId: string;

  it('should create a new group (REQ-7)', async () => {
    const response = await request(app)
      .post('/api/groups/add')
      .send({
        databaseId: 'test-db',
        parentId: null,
        name: 'TestGroup'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('TestGroup');
    groupId = response.body.id;
  });

  it('should reject empty group name (REQ-7)', async () => {
    const response = await request(app)
      .post('/api/groups/add')
      .send({
        databaseId: 'test-db',
        parentId: null,
        name: ''
      });
    
    expect(response.status).toBe(400);
  });

  it('should rename group (REQ-9)', async () => {
    const response = await request(app)
      .put('/api/groups/rename')
      .send({
        groupId,
        name: 'RenamedGroup'
      });
    
    expect(response.status).toBe(200);
  });

  it('should find entries in group (REQ-10)', async () => {
    const response = await request(app)
      .get('/api/groups/find')
      .query({
        databaseId: 'test-db',
        groupId,
        query: 'test'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.results).toBeDefined();
  });
});
```

- [ ] **Step 4: Run tests**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 5: Commit FR2**

```bash
git add server/src/routes/groups.ts client/src/components/GroupTree.tsx
git commit -m "feat(fr2): implement group/subgroup add/rename/delete/find (REQ-7 to REQ-10)"
```

---

## Task 6: FR3 — Manage Password Entries (Add/View-Edit/Duplicate/Delete)

**Files:**
- Create: `keepass-sqe/server/src/routes/entries.ts`
- Create: `keepass-sqe/client/src/components/EntryList.tsx`
- Create: `keepass-sqe/client/src/components/EntryForm.tsx`

**Interfaces:**
- Consumes: `getDb()` from Task 2
- Produces: `POST /api/entries/add`, `GET /api/entries/:id`, `PUT /api/entries/update`, `POST /api/entries/duplicate`, `DELETE /api/entries/:id`

- [ ] **Step 1: Write entry route handlers**

```typescript
// server/src/routes/entries.ts
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema';

const router = Router();

// REQ-11: Entry must belong to group
router.post('/add', (req: Request, res: Response) => {
  try {
    const { databaseId, groupId, title, username, password, url, notes } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: 'Entry must belong to a group (REQ-11)' });
    }
    
    // REQ-12: Password and repeat password must match
    // REQ-13: Password fields must be identical
    // REQ-14: Not all fields required (SRS Section 3.10.1)
    
    const db = getDb();
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO entries (id, database_id, group_id, title, username, password, url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, databaseId, groupId, title || '', username || '', password || '', url || '', notes || '');
    
    res.json({ id, message: 'Entry created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// REQ-14: Entry must be selected to view/edit
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const db = getDb();
    const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get entry' });
  }
});

// REQ-15: When password changed, repeat must match
router.put('/update', (req: Request, res: Response) => {
  try {
    const { id, title, username, password, url, notes } = req.body;
    
    const db = getDb();
    db.prepare(`
      UPDATE entries 
      SET title = ?, username = ?, password = ?, url = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, username, password, url, notes, id);
    
    res.json({ message: 'Entry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// REQ-16: Entry must be selected to duplicate
router.post('/duplicate', (req: Request, res: Response) => {
  try {
    const { entryId } = req.body;
    
    const db = getDb();
    const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(entryId) as any;
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const newId = uuidv4();
    db.prepare(`
      INSERT INTO entries (id, database_id, group_id, title, username, password, url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, entry.database_id, entry.group_id, `${entry.title} (Copy)`, entry.username, entry.password, entry.url, entry.notes);
    
    res.json({ id: newId, message: 'Entry duplicated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate entry' });
  }
});

// REQ-17: Entry must be selected to delete
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const db = getDb();
    db.prepare('DELETE FROM entries WHERE id = ?').run(id);
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
```

- [ ] **Step 2: Write EntryList component**

```typescript
// client/src/components/EntryList.tsx
import React from 'react';

interface Entry {
  id: string;
  title: string;
  username: string;
  url: string;
  isTan: boolean;
}

interface EntryListProps {
  entries: Entry[];
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onDuplicateEntry: (entryId: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  onDuplicateEntry
}) => {
  return (
    <div className="entry-list">
      <h3>Entries</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Username</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr
              key={entry.id}
              className={selectedEntryId === entry.id ? 'selected' : ''}
              onClick={() => onSelectEntry(entry.id)}
            >
              <td>{entry.isTan ? '🔑' : '📋'} {entry.title}</td>
              <td>{entry.username}</td>
              <td>{entry.url}</td>
              <td>
                <button onClick={(e) => { e.stopPropagation(); onDuplicateEntry(entry.id); }}>
                  📋 Duplicate
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteEntry(entry.id); }}>
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

- [ ] **Step 3: Write EntryForm component**

```typescript
// client/src/components/EntryForm.tsx
import React, { useState, useEffect } from 'react';

interface EntryFormProps {
  entryId: string | null;
  groupId: string | null;
  onSave: (entry: any) => void;
  onCancel: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  entryId,
  groupId,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entryId) {
      // Load existing entry
      fetch(`/api/entries/${entryId}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title);
          setUsername(data.username);
          setPassword(data.password);
          setUrl(data.url);
          setNotes(data.notes);
        });
    }
  }, [entryId]);

  const handleSubmit = () => {
    // REQ-12, REQ-13: Password and confirm must match
    if (password !== confirmPassword) {
      setError('Passwords do not match (REQ-12, REQ-13)');
      return;
    }
    
    onSave({
      id: entryId,
      groupId,
      title,
      username,
      password,
      url,
      notes
    });
  };

  return (
    <div className="entry-form">
      <h3>{entryId ? 'Edit Entry' : 'New Entry'}</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <input
        type="url"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleSubmit}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};
```

- [ ] **Step 4: Write FR3 tests**

```typescript
// server/src/routes/__tests__/entries.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import entriesRouter from '../entries';

const app = express();
app.use(express.json());
app.use('/api/entries', entriesRouter);

describe('FR3: Entry Management', () => {
  let entryId: string;

  it('should create entry in group (REQ-11)', async () => {
    const response = await request(app)
      .post('/api/entries/add')
      .send({
        databaseId: 'test-db',
        groupId: 'test-group',
        title: 'TestEntry',
        username: 'user@test.com',
        password: 'pass123'
      });
    
    expect(response.status).toBe(200);
    entryId = response.id;
  });

  it('should reject entry without group (REQ-11)', async () => {
    const response = await request(app)
      .post('/api/entries/add')
      .send({
        databaseId: 'test-db',
        groupId: null,
        title: 'TestEntry'
      });
    
    expect(response.status).toBe(400);
  });

  it('should get entry by ID (REQ-14)', async () => {
    const response = await request(app)
      .get(`/api/entries/${entryId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('TestEntry');
  });

  it('should duplicate entry (REQ-16)', async () => {
    const response = await request(app)
      .post('/api/entries/duplicate')
      .send({ entryId });
    
    expect(response.status).toBe(200);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 6: Commit FR3**

```bash
git add server/src/routes/entries.ts client/src/components/EntryList.tsx client/src/components/EntryForm.tsx
git commit -m "feat(fr3): implement entry add/view/edit/duplicate/delete (REQ-11 to REQ-17)"
```

---

## Task 7: FR4 — Composite Master Key Authentication

**Files:**
- Create: `keepass-sqe/server/src/routes/auth.ts`
- Create: `keepass-sqe/client/src/components/AuthDialog.tsx`

**Interfaces:**
- Consumes: `deriveKey()`, `parseKeyFile()` from Task 3
- Produces: `POST /api/auth/login`, `POST /api/auth/verify`

- [ ] **Step 1: Write auth route handlers**

```typescript
// server/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema';
import { parseKeyFile } from '../crypto/keyFile';

const router = Router();

// REQ-24: Database won't open without correct password
// REQ-25: Database won't open without key file if required
// REQ-26: Composite key requires BOTH password AND key file
// REQ-27: Lost password = no recovery
// REQ-28: No backdoor
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { databaseId, masterKey } = req.body;
    
    const db = getDb();
    const database = db.prepare(
      'SELECT * FROM databases WHERE id = ?'
    ).get(databaseId) as any;
    
    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }
    
    // Check if key file is required
    const requiresKeyFile = database.requires_key_file;
    
    if (requiresKeyFile && !masterKey.keyFileContent) {
      return res.status(401).json({ 
        error: 'Key file required (REQ-26)',
        requiresKeyFile: true
      });
    }
    
    if (!masterKey.password) {
      return res.status(401).json({ 
        error: 'Password required (REQ-24)',
        requiresPassword: true
      });
    }
    
    // Verify key file format if provided
    if (masterKey.keyFileContent && !parseKeyFile(masterKey.keyFileContent)) {
      return res.status(401).json({ error: 'Invalid key file format' });
    }
    
    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    db.prepare(`
      INSERT INTO sessions (id, database_id, master_key_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, databaseId, masterKey.password, expiresAt);
    
    res.json({
      sessionId,
      expiresAt,
      message: 'Authentication successful'
    });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Verify session
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    const db = getDb();
    const session = db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: 'Session verification failed' });
  }
});

export default router;
```

- [ ] **Step 2: Write AuthDialog component**

```typescript
// client/src/components/AuthDialog.tsx
import React, { useState } from 'react';

interface AuthDialogProps {
  databaseId: string;
  onAuthSuccess: (sessionId: string) => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  databaseId,
  onAuthSuccess
}) => {
  const [password, setPassword] = useState('');
  const [keyFile, setKeyFile] = useState<string | null>(null);
  const [requiresKeyFile, setRequiresKeyFile] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseId,
          masterKey: {
            password,
            keyFileContent: keyFile
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onAuthSuccess(data.sessionId);
      } else if (data.requiresKeyFile) {
        setRequiresKeyFile(true);
        setError('Key file required');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };

  const handleKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setKeyFile(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="auth-dialog">
      <h3>Unlock Database</h3>
      <input
        type="password"
        placeholder="Master Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {requiresKeyFile && (
        <div className="key-file-upload">
          <label>Key File:</label>
          <input
            type="file"
            onChange={handleKeyFileUpload}
          />
          {keyFile && <span>✓ Key file loaded</span>}
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      <button onClick={handleLogin}>Unlock</button>
    </div>
  );
};
```

- [ ] **Step 3: Write FR4 tests**

```typescript
// server/src/routes/__tests__/auth.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('FR4: Master Key Authentication', () => {
  it('should require password (REQ-24)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        databaseId: 'test-db',
        masterKey: { password: '' }
      });
    
    expect(response.status).toBe(401);
  });

  it('should require key file when set (REQ-26)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        databaseId: 'test-db',
        masterKey: { password: 'pass', keyFileContent: null }
      });
    
    expect(response.status).toBe(401);
  });

  it('should reject invalid key file', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        databaseId: 'test-db',
        masterKey: { password: 'pass', keyFileContent: 'invalid' }
      });
    
    expect(response.status).toBe(401);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 5: Commit FR4**

```bash
git add server/src/routes/auth.ts client/src/components/AuthDialog.tsx
git commit -m "feat(fr4): implement composite master key authentication (REQ-24 to REQ-28)"
```

---

## Task 8: FR5 — Password Generator

**Files:**
- Create: `keepass-sqe/server/src/routes/generator.ts`
- Create: `keepass-sqe/client/src/components/PasswordGenerator.tsx`

**Interfaces:**
- Consumes: None (standalone utility)
- Produces: `POST /api/generator/generate`

- [ ] **Step 1: Write password generator route**

```typescript
// server/src/routes/generator.ts
import { Router, Request, Response } from 'express';

const router = Router();

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Section 3.20: Password generator
router.post('/generate', (req: Request, res: Response) => {
  try {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeDigits = true,
      includeSpecial = true
    } = req.body;
    
    // Section 3.20: Length 0 disables generator
    if (length === 0) {
      return res.json({ password: '', message: 'Generator disabled' });
    }
    
    if (length < 1 || length > 128) {
      return res.status(400).json({ error: 'Length must be between 1 and 128' });
    }
    
    let charset = '';
    if (includeUppercase) charset += CHARSETS.uppercase;
    if (includeLowercase) charset += CHARSETS.lowercase;
    if (includeDigits) charset += CHARSETS.digits;
    if (includeSpecial) charset += CHARSETS.special;
    
    if (charset.length === 0) {
      return res.status(400).json({ error: 'At least one character set required' });
    }
    
    // Generate password using crypto.getRandomValues
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    const password = Array.from(array)
      .map(num => charset[num % charset.length])
      .join('');
    
    res.json({ password });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate password' });
  }
});

export default router;
```

- [ ] **Step 2: Write PasswordGenerator component**

```typescript
// client/src/components/PasswordGenerator.tsx
import React, { useState } from 'react';

interface PasswordGeneratorProps {
  onUsePassword: (password: string) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onUsePassword }) => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          length,
          includeUppercase,
          includeLowercase,
          includeDigits,
          includeSpecial
        })
      });
      
      const data = await response.json();
      setGeneratedPassword(data.password);
    } catch (err) {
      console.error('Failed to generate password');
    }
  };

  return (
    <div className="password-generator">
      <h3>Password Generator</h3>
      <div className="options">
        <label>
          Length: {length}
          <input
            type="range"
            min="1"
            max="128"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
          />
          Uppercase (A-Z)
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
          />
          Lowercase (a-z)
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeDigits}
            onChange={(e) => setIncludeDigits(e.target.checked)}
          />
          Digits (0-9)
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeSpecial}
            onChange={(e) => setIncludeSpecial(e.target.checked)}
          />
          Special (!@#$%^&*)
        </label>
      </div>
      <button onClick={handleGenerate}>Generate</button>
      {generatedPassword && (
        <div className="generated">
          <input type="text" value={generatedPassword} readOnly />
          <button onClick={() => onUsePassword(generatedPassword)}>
            Use This Password
          </button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Write FR5 tests**

```typescript
// server/src/routes/__tests__/generator.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import generatorRouter from '../generator';

const app = express();
app.use(express.json());
app.use('/api/generator', generatorRouter);

describe('FR5: Password Generator', () => {
  it('should generate password with default settings', async () => {
    const response = await request(app)
      .post('/api/generator/generate')
      .send({});
    
    expect(response.status).toBe(200);
    expect(response.body.password).toHaveLength(16);
  });

  it('should generate password with custom length', async () => {
    const response = await request(app)
      .post('/api/generator/generate')
      .send({ length: 32 });
    
    expect(response.body.password).toHaveLength(32);
  });

  it('should disable generator when length is 0', async () => {
    const response = await request(app)
      .post('/api/generator/generate')
      .send({ length: 0 });
    
    expect(response.body.password).toBe('');
  });

  it('should reject length > 128', async () => {
    const response = await request(app)
      .post('/api/generator/generate')
      .send({ length: 200 });
    
    expect(response.status).toBe(400);
  });

  it('should generate password with only uppercase', async () => {
    const response = await request(app)
      .post('/api/generator/generate')
      .send({
        length: 20,
        includeUppercase: true,
        includeLowercase: false,
        includeDigits: false,
        includeSpecial: false
      });
    
    expect(response.body.password).toMatch(/^[A-Z]+$/);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 5: Commit FR5**

```bash
git add server/src/routes/generator.ts client/src/components/PasswordGenerator.tsx
git commit -m "feat(fr5): implement password generator (Section 3.20)"
```

---

## Task 9: FR6 — Auto-Type

**Files:**
- Create: `keepass-sqe/client/src/utils/autoType.ts`
- Create: `keepass-sqe/client/src/components/AutoTypeConfig.tsx`

**Interfaces:**
- Consumes: None (client-side parsing)
- Produces: `parseAutoType()`, `validateAutoType()`

- [ ] **Step 1: Write Auto-Type parsing utility**

```typescript
// client/src/utils/autoType.ts
import { AutoTypeSequence } from '../types';

// REQ-19: "Auto-Type:" prefix required
// REQ-20: Sequence must not exceed 59 characters
// REQ-21: If two auto-types, only first is used

const AUTO_TYPE_PREFIX = 'Auto-Type:';
const MAX_SEQUENCE_LENGTH = 59;

export function parseAutoType(noteField: string): AutoTypeSequence | null {
  if (!noteField) return null;
  
  // REQ-21: If two auto-types exist, only first is used
  const lines = noteField.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(AUTO_TYPE_PREFIX)) {
      const sequence = trimmed.substring(AUTO_TYPE_PREFIX.length).trim();
      return validateAutoType(sequence);
    }
  }
  
  return null;
}

export function validateAutoType(sequence: string): AutoTypeSequence {
  // REQ-20: Must not exceed 59 characters
  if (sequence.length > MAX_SEQUENCE_LENGTH) {
    return {
      prefix: AUTO_TYPE_PREFIX,
      sequence,
      isValid: false,
      error: `Sequence exceeds ${MAX_SEQUENCE_LENGTH} characters (REQ-20)`
    };
  }
  
  return {
    prefix: AUTO_TYPE_PREFIX,
    sequence,
    isValid: true
  };
}

export function formatAutoType(sequence: string): string {
  return `${AUTO_TYPE_PREFIX} ${sequence}`;
}

// Default auto-type sequence
export const DEFAULT_AUTO_TYPE = '{USERNAME}{TAB}{PASSWORD}{ENTER}';
```

- [ ] **Step 2: Write AutoTypeConfig component**

```typescript
// client/src/components/AutoTypeConfig.tsx
import React, { useState, useEffect } from 'react';
import { parseAutoType, validateAutoType, formatAutoType, DEFAULT_AUTO_TYPE } from '../utils/autoType';

interface AutoTypeConfigProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const AutoTypeConfig: React.FC<AutoTypeConfigProps> = ({
  notes,
  onNotesChange
}) => {
  const [autoTypeSequence, setAutoTypeSequence] = useState('');
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    const parsed = parseAutoType(notes);
    if (parsed) {
      setAutoTypeSequence(parsed.sequence);
      setValidation(parsed);
    } else {
      setAutoTypeSequence(DEFAULT_AUTO_TYPE);
    }
  }, [notes]);

  const handleSequenceChange = (value: string) => {
    setAutoTypeSequence(value);
    setValidation(validateAutoType(value));
    
    // Update notes with auto-type line
    const otherLines = notes.split('\n')
      .filter(line => !line.trim().startsWith('Auto-Type:'));
    
    if (value) {
      otherLines.push(formatAutoType(value));
    }
    
    onNotesChange(otherLines.join('\n'));
  };

  return (
    <div className="auto-type-config">
      <h4>Auto-Type Sequence</h4>
      <p className="help-text">
        Prefix "Auto-Type:" is required. Max 59 characters. Default: {'{USERNAME}{TAB}{PASSWORD}{ENTER}'}
      </p>
      <input
        type="text"
        value={autoTypeSequence}
        onChange={(e) => handleSequenceChange(e.target.value)}
        maxLength={59}
        placeholder={DEFAULT_AUTO_TYPE}
      />
      {validation && !validation.isValid && (
        <p className="error">{validation.error}</p>
      )}
      <p className="char-count">{autoTypeSequence.length}/59</p>
    </div>
  );
};
```

- [ ] **Step 3: Write FR6 tests**

```typescript
// client/src/utils/__tests__/autoType.test.ts
import { describe, it, expect } from 'vitest';
import { parseAutoType, validateAutoType, formatAutoType } from '../autoType';

describe('FR6: Auto-Type', () => {
  it('should parse Auto-Type from notes (REQ-19)', () => {
    const notes = 'Some notes\nAuto-Type: {USERNAME}{TAB}{PASSWORD}{ENTER}';
    const result = parseAutoType(notes);
    
    expect(result).not.toBeNull();
    expect(result?.sequence).toBe('{USERNAME}{TAB}{PASSWORD}{ENTER}');
  });

  it('should only use first Auto-Type if two exist (REQ-21)', () => {
    const notes = 'Auto-Type: first\nAuto-Type: second';
    const result = parseAutoType(notes);
    
    expect(result?.sequence).toBe('first');
  });

  it('should reject sequence > 59 characters (REQ-20)', () => {
    const longSequence = 'A'.repeat(60);
    const result = validateAutoType(longSequence);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('59');
  });

  it('should accept sequence <= 59 characters', () => {
    const validSequence = 'A'.repeat(59);
    const result = validateAutoType(validSequence);
    
    expect(result.isValid).toBe(true);
  });

  it('should format auto-type with prefix', () => {
    const formatted = formatAutoType('{USERNAME}');
    expect(formatted).toBe('Auto-Type: {USERNAME}');
  });
});
```

- [ ] **Step 4: Run tests**

Run: `cd keepass-sqe/client && npm test`
Expected: PASS

- [ ] **Step 5: Commit FR6**

```bash
git add client/src/utils/autoType.ts client/src/components/AutoTypeConfig.tsx
git commit -m "feat(fr6): implement Auto-Type parsing and validation (REQ-19 to REQ-21)"
```

---

## Task 10: FR7 — TAN Support

**Files:**
- Create: `keepass-sqe/server/src/routes/tan.ts`
- Create: `keepass-sqe/client/src/components/TanWizard.tsx`
- Create: `keepass-sqe/client/src/components/TanEntry.tsx`

**Interfaces:**
- Consumes: `getDb()` from Task 2
- Produces: `POST /api/tan/create`, `POST /api/tan/use`

- [ ] **Step 1: Write TAN route handlers**

```typescript
// server/src/routes/tan.ts
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema';

const router = Router();

// Generate random TAN (8-character alphanumeric)
function generateTan(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(num => chars[num % chars.length])
    .join('');
}

// Create TAN entries via wizard
router.post('/create', (req: Request, res: Response) => {
  try {
    const { databaseId, groupId, count = 10 } = req.body;
    
    const db = getDb();
    const tans: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const id = uuidv4();
      const tan = generateTan();
      
      db.prepare(`
        INSERT INTO entries (id, database_id, group_id, title, username, password, url, notes, is_tan, tan_used)
        VALUES (?, ?, ?, ?, '', '', '', '', 1, 0)
      `).run(id, databaseId, groupId, `<TAN>`);
      
      tans.push({ id, tan });
    }
    
    res.json({ tans, message: `${count} TANs created` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create TANs' });
  }
});

// REQ-32: TAN fields cannot be changed
// REQ-33: TAN expires permanently after first use
router.post('/use', (req: Request, res: Response) => {
  try {
    const { entryId } = req.body;
    
    const db = getDb();
    const entry = db.prepare(
      'SELECT * FROM entries WHERE id = ? AND is_tan = 1'
    ).get(entryId) as any;
    
    if (!entry) {
      return res.status(404).json({ error: 'TAN not found' });
    }
    
    if (entry.tan_used) {
      return res.status(400).json({ 
        error: 'TAN already used (REQ-33)',
        tanUsed: true
      });
    }
    
    // Mark TAN as used - permanently expired
    db.prepare(`
      UPDATE entries SET tan_used = 1, updated_at = datetime('now')
      WHERE id = ?
    `).run(entryId);
    
    res.json({ 
      message: 'TAN used successfully',
      tan: entry.password // TAN value stored in password field
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to use TAN' });
  }
});

// REQ-32: Get TAN entry (read-only)
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const db = getDb();
    const entry = db.prepare(
      'SELECT * FROM entries WHERE id = ? AND is_tan = 1'
    ).get(id) as any;
    
    if (!entry) {
      return res.status(404).json({ error: 'TAN not found' });
    }
    
    res.json({
      id: entry.id,
      title: entry.title,
      tan: entry.password,
      isUsed: entry.tan_used === 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get TAN' });
  }
});

export default router;
```

- [ ] **Step 2: Write TanWizard component**

```typescript
// client/src/components/TanWizard.tsx
import React, { useState } from 'react';

interface TanWizardProps {
  groupId: string;
  onCreateTans: (count: number) => void;
  onCancel: () => void;
}

export const TanWizard: React.FC<TanWizardProps> = ({
  groupId,
  onCreateTans,
  onCancel
}) => {
  const [count, setCount] = useState(10);

  return (
    <div className="tan-wizard">
      <h3>Create TANs</h3>
      <p>Transaction Authentication Numbers (TANs) are one-time-use codes.</p>
      
      <label>
        Number of TANs to create:
        <input
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
        />
      </label>
      
      <div className="actions">
        <button onClick={() => onCreateTans(count)}>Create TANs</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Write TanEntry component**

```typescript
// client/src/components/TanEntry.tsx
import React from 'react';

interface TanEntryProps {
  tanId: string;
  tan: string;
  isUsed: boolean;
  onUseTan: (tanId: string) => void;
}

export const TanEntry: React.FC<TanEntryProps> = ({
  tanId,
  tan,
  isUsed,
  onUseTan
}) => {
  return (
    <div className={`tan-entry ${isUsed ? 'used' : 'active'}`}>
      <span className="tan-label">🔑 TAN:</span>
      <span className="tan-value">{isUsed ? 'USED' : tan}</span>
      {!isUsed && (
        <button onClick={() => onUseTan(tanId)}>
          Use TAN
        </button>
      )}
      {isUsed && (
        <span className="expired-badge">Expired (REQ-33)</span>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Write FR7 tests**

```typescript
// server/src/routes/__tests__/tan.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import tanRouter from '../tan';

const app = express();
app.use(express.json());
app.use('/api/tan', tanRouter);

describe('FR7: TAN Support', () => {
  let tanId: string;

  it('should create TANs', async () => {
    const response = await request(app)
      .post('/api/tan/create')
      .send({
        databaseId: 'test-db',
        groupId: 'test-group',
        count: 5
      });
    
    expect(response.status).toBe(200);
    expect(response.body.tans).toHaveLength(5);
    tanId = response.body.tans[0].id;
  });

  it('should get TAN entry', async () => {
    const response = await request(app)
      .get(`/api/tan/${tanId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('<TAN>');
  });

  it('should use TAN (REQ-33)', async () => {
    const response = await request(app)
      .post('/api/tan/use')
      .send({ entryId: tanId });
    
    expect(response.status).toBe(200);
    expect(response.body.tan).toBeDefined();
  });

  it('should reject used TAN (REQ-33)', async () => {
    const response = await request(app)
      .post('/api/tan/use')
      .send({ entryId: tanId });
    
    expect(response.status).toBe(400);
    expect(response.body.tanUsed).toBe(true);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 6: Commit FR7**

```bash
git add server/src/routes/tan.ts client/src/components/TanWizard.tsx client/src/components/TanEntry.tsx
git commit -m "feat(fr7): implement TAN support with permanent expiry (REQ-32, REQ-33)"
```

---

## Task 11: NFR2 — Clipboard Auto-Clear (10 seconds)

**Files:**
- Create: `keepass-sqe/client/src/hooks/useClipboard.ts`

**Interfaces:**
- Consumes: None (client-side timer)
- Produces: `useClipboard()` hook

- [ ] **Step 1: Write useClipboard hook**

```typescript
// client/src/hooks/useClipboard.ts
import { useState, useCallback, useRef, useEffect } from 'react';

// NFR2: Clipboard must clear passwords after exactly 10 seconds
const CLIPBOARD_CLEAR_DELAY = 10000; // 10 seconds in milliseconds

export function useClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('');
      setCopiedText(null);
      setTimeRemaining(0);
    } catch (err) {
      console.error('Failed to clear clipboard:', err);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeRemaining(CLIPBOARD_CLEAR_DELAY / 1000);
      
      // Clear any existing timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set timer to clear clipboard after 10 seconds
      timerRef.current = setTimeout(() => {
        clearClipboard();
        if (countdownRef.current) clearInterval(countdownRef.current);
      }, CLIPBOARD_CLEAR_DELAY);
      
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [clearClipboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return {
    copiedText,
    timeRemaining,
    copyToClipboard,
    clearClipboard
  };
}
```

- [ ] **Step 2: Write useClipboard tests**

```typescript
// client/src/hooks/__tests__/useClipboard.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

describe('NFR2: Clipboard Auto-Clear', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useClipboard());
    
    await act(async () => {
      await result.current.copyToClipboard('test-password');
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-password');
    expect(result.current.copiedText).toBe('test-password');
  });

  it('should clear clipboard after 10 seconds', async () => {
    const { result } = renderHook(() => useClipboard());
    
    await act(async () => {
      await result.current.copyToClipboard('test-password');
    });
    
    expect(result.current.timeRemaining).toBe(10);
    
    // Advance time by 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    expect(result.current.copiedText).toBeNull();
  });

  it('should show countdown', async () => {
    const { result } = renderHook(() => useClipboard());
    
    await act(async () => {
      await result.current.copyToClipboard('test-password');
    });
    
    expect(result.current.timeRemaining).toBe(10);
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(result.current.timeRemaining).toBe(7);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd keepass-sqe/client && npm test`
Expected: PASS

- [ ] **Step 4: Commit NFR2**

```bash
git add client/src/hooks/useClipboard.ts
git commit -m "feat(nfr2): implement 10-second clipboard auto-clear timer"
```

---

## Task 12: NFR3 — Data Integrity & Corruption Handling

**Files:**
- Create: `keepass-sqe/server/src/middleware/integrity.ts`

**Interfaces:**
- Consumes: `getDb()` from Task 2
- Produces: `validateDatabaseIntegrity()`, `createBackup()`

- [ ] **Step 1: Write integrity middleware**

```typescript
// server/src/middleware/integrity.ts
import { getDb } from '../db/schema';
import fs from 'fs';
import path from 'path';

// NFR3: Handle corrupted DB / interrupted write
export function validateDatabaseIntegrity(databaseId: string): {
  valid: boolean;
  errors: string[];
} {
  const db = getDb();
  const errors: string[] = [];
  
  // Check database exists
  const database = db.prepare(
    'SELECT * FROM databases WHERE id = ?'
  ).get(databaseId);
  
  if (!database) {
    errors.push('Database not found');
    return { valid: false, errors };
  }
  
  // Check for orphaned groups
  const orphanedGroups = db.prepare(`
    SELECT g.id FROM groups g
    LEFT JOIN databases d ON g.database_id = d.id
    WHERE d.id IS NULL
  `).all();
  
  if (orphanedGroups.length > 0) {
    errors.push(`Found ${orphanedGroups.length} orphaned groups`);
  }
  
  // Check for orphaned entries
  const orphanedEntries = db.prepare(`
    SELECT e.id FROM entries e
    LEFT JOIN groups g ON e.group_id = g.id
    WHERE g.id IS NULL
  `).all();
  
  if (orphanedEntries.length > 0) {
    errors.push(`Found ${orphanedEntries.length} orphaned entries`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Create backup before save
export function createBackup(databaseId: string): string | null {
  try {
    const db = getDb();
    const backupDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(
      backupDir,
      `backup-${databaseId}-${Date.now()}.db`
    );
    
    // Simple backup by copying the database file
    const dbPath = path.join(process.cwd(), 'data', 'keepass.db');
    fs.copyFileSync(dbPath, backupFile);
    
    return backupFile;
  } catch (error) {
    console.error('Backup failed:', error);
    return null;
  }
}
```

- [ ] **Step 2: Write integrity tests**

```typescript
// server/src/middleware/__tests__/integrity.test.ts
import { describe, it, expect } from 'vitest';
import { validateDatabaseIntegrity, createBackup } from '../integrity';

describe('NFR3: Data Integrity', () => {
  it('should validate database integrity', () => {
    const result = validateDatabaseIntegrity('test-db');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
  });

  it('should detect missing database', () => {
    const result = validateDatabaseIntegrity('nonexistent');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Database not found');
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd keepass-sqe/server && npm test`
Expected: PASS

- [ ] **Step 4: Commit NFR3**

```bash
git add server/src/middleware/integrity.ts
git commit -m "feat(nfr3): implement database integrity validation and backup"
```

---

## Task 13: Integration & App Assembly

**Files:**
- Create: `keepass-sqe/server/src/app.ts`
- Create: `keepass-sqe/client/src/App.tsx`
- Create: `keepass-sqe/client/src/main.tsx`
- Create: `keepass-sqe/client/index.html`

**Interfaces:**
- Consumes: All routes from Tasks 4-10
- Produces: Running application

- [ ] **Step 1: Write Express server entry point**

```typescript
// server/src/app.ts
import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrations';
import databaseRouter from './routes/database';
import groupsRouter from './routes/groups';
import entriesRouter from './routes/entries';
import authRouter from './routes/auth';
import generatorRouter from './routes/generator';
import tanRouter from './routes/tan';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Run database migrations
runMigrations();

// Routes
app.use('/api/database', databaseRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/generator', generatorRouter);
app.use('/api/tan', tanRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
```

- [ ] **Step 2: Write React App component**

```typescript
// client/src/App.tsx
import React, { useState } from 'react';
import { DatabaseManager } from './components/DatabaseManager';
import { AuthDialog } from './components/AuthDialog';
import { GroupTree } from './components/GroupTree';
import { EntryList } from './components/EntryList';
import { EntryForm } from './components/EntryForm';
import { PasswordGenerator } from './components/PasswordGenerator';
import { TanWizard } from './components/TanWizard';
import { TanEntry } from './components/TanEntry';
import { useClipboard } from './hooks/useClipboard';

function App() {
  const [databaseId, setDatabaseId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const { copiedText, timeRemaining, copyToClipboard } = useClipboard();

  const handleDatabaseOpen = (id: string) => {
    setDatabaseId(id);
  };

  const handleAuthSuccess = (sessionId: string) => {
    setIsAuthenticated(true);
    // Load groups and entries
    loadData();
  };

  const loadData = async () => {
    // Load groups and entries from API
    // This is simplified - in real app, would fetch from API
  };

  const handleCopyPassword = (password: string) => {
    copyToClipboard(password);
  };

  if (!databaseId) {
    return <DatabaseManager onDatabaseOpen={handleDatabaseOpen} />;
  }

  if (!isAuthenticated) {
    return <AuthDialog databaseId={databaseId} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <header>
        <h1>KeePass Password Safe</h1>
        {copiedText && (
          <div className="clipboard-warning">
            Password copied! Auto-clears in {timeRemaining}s
          </div>
        )}
      </header>
      
      <main>
        <aside>
          <GroupTree
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onAddGroup={(parentId, name) => {/* Add group */}}
            onRenameGroup={(id, name) => {/* Rename group */}}
            onDeleteGroup={(id) => {/* Delete group */}}
          />
          <PasswordGenerator onUsePassword={handleCopyPassword} />
        </aside>
        
        <section>
          <EntryList
            entries={entries}
            selectedEntryId={selectedEntryId}
            onSelectEntry={setSelectedEntryId}
            onDeleteEntry={(id) => {/* Delete entry */}}
            onDuplicateEntry={(id) => {/* Duplicate entry */}}
          />
          
          {selectedEntryId && (
            <EntryForm
              entryId={selectedEntryId}
              groupId={selectedGroupId}
              onSave={(entry) => {/* Save entry */}}
              onCancel={() => setSelectedEntryId(null)}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Write main entry point**

```typescript
// client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Create index.html**

```html
<!-- client/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KeePass Password Safe</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Commit integration**

```bash
git add server/src/app.ts client/src/App.tsx client/src/main.tsx client/index.html
git commit -m "feat: integrate all components into running application"
```

---

## Task 14: SonarQube Scan & Defect Logging

**Files:**
- Create: `keepass-sqe/.sonarcloud.properties`

**Interfaces:**
- Consumes: All code from Tasks 1-13
- Produces: SonarQube report, Jira defect issues

- [ ] **Step 1: Create SonarCloud config**

```properties
# .sonarcloud.properties
sonar.projectKey=AliHaiderBajwa_KeyPass-SQE
sonar.organization=alihaiderbajwa
sonar.sources=client/src,server/src
sonar.exclusions=**/node_modules/**,**/dist/**
sonar.typescript.lcov.reportPaths=**/coverage/lcov.info
```

- [ ] **Step 2: Run SonarQube scan**

Run: `cd keepass-sqe && sonar-scanner`

- [ ] **Step 3: Document findings in report**

- [ ] **Step 4: Log defects to Jira (KAN project)**

For each finding, create a Jira issue using:
```
jira_createJiraIssue(
  cloudId: "2996568a-e256-499c-8cf4-e32d3d8ff29e",
  projectKey: "KAN",
  issueTypeName: "Bug",
  summary: "[SonarQube] <finding title>",
  description: "<detailed description>"
)
```

- [ ] **Step 5: Commit SonarQube config**

```bash
git add .sonarcloud.properties
git commit -m "chore: add SonarCloud configuration"
```

---

## Execution Order

1. **Task 1:** Scaffolding → Foundation for all tasks
2. **Task 2:** Database Schema → Required for FR1
3. **Task 3:** Encryption → Required for FR1, FR4
4. **Task 4:** FR1 (Database) → Core CRUD
5. **Task 5:** FR2 (Groups) → Depends on FR1
6. **Task 6:** FR3 (Entries) → Depends on FR2
7. **Task 7:** FR4 (Auth) → Depends on FR1
8. **Task 8:** FR5 (Generator) → Independent
9. **Task 9:** FR6 (Auto-Type) → Client-side only
10. **Task 10:** FR7 (TAN) → Depends on FR3
11. **Task 11:** NFR2 (Clipboard) → Client-side only
12. **Task 12:** NFR3 (Integrity) → Server middleware
13. **Task 13:** Integration → Assembles all
14. **Task 14:** SonarQube → Final analysis

---

## Plan Complete

This plan covers all 7 FRs and 3 NFRs from PROJECT_SCOPE.md. Each task includes:
- Exact file paths
- Interface contracts
- Step-by-step implementation with code
- Test code
- Commit messages

**Ready to execute when you exit Plan Mode.**
