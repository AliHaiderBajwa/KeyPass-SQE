import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(process.cwd(), 'data', 'keypass.db');
import fs from 'fs';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Run migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS databases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    database_id TEXT NOT NULL,
    parent_id TEXT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    database_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    title TEXT NOT NULL,
    username TEXT DEFAULT '',
    password TEXT DEFAULT '',
    url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  );
`);

// Current session
let currentDatabaseId: string | null = null;

// Helper: hash password
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Helper: build group tree
function buildGroupTree(groups: any[], entries: any[]): any[] {
  const map = new Map<string, any>();
  const roots: any[] = [];

  for (const g of groups) {
    map.set(g.id, { ...g, children: [], entries: [] });
  }

  for (const e of entries) {
    const group = map.get(e.group_id);
    if (group) {
      group.entries.push(e);
    }
  }

  for (const g of groups) {
    const node = map.get(g.id)!;
    if (g.parent_id && map.has(g.parent_id)) {
      map.get(g.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// === DATABASE ROUTES ===

// POST /api/database - Create new database
app.post('/api/database', (req, res) => {
  try {
    const { name, password, keyFilePath } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Database name is required' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if database name already exists
    const existing = db.prepare('SELECT id FROM databases WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'A database with this name already exists' });
    }

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(32).toString('hex');
    const passwordHash = hashPassword(password, salt);

    db.prepare('INSERT INTO databases (id, name, password_hash, salt) VALUES (?, ?, ?, ?)').run(
      id, name, passwordHash, salt
    );

    // Create root group
    const rootGroupId = crypto.randomUUID();
    db.prepare('INSERT INTO groups (id, database_id, parent_id, name) VALUES (?, ?, NULL, ?)').run(
      rootGroupId, id, name
    );

    // Set as current database
    currentDatabaseId = id;

    const groups = db.prepare('SELECT * FROM groups WHERE database_id = ?').all(id);
    const entries = db.prepare('SELECT * FROM entries WHERE database_id = ?').all(id);
    const tree = buildGroupTree(groups, entries);

    res.json({
      id,
      name,
      path: dbPath,
      groups: tree,
      rootGroupId,
      message: 'Database created successfully'
    });
  } catch (error: any) {
    console.error('Create database error:', error);
    res.status(500).json({ error: error.message || 'Failed to create database' });
  }
});

// POST /api/database/open - Open existing database
app.post('/api/database/open', (req, res) => {
  try {
    const { name, password, keyFilePath } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Database name is required' });
    }

    const database = db.prepare('SELECT * FROM databases WHERE name = ?').get(name) as any;

    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }

    // Verify password
    const passwordHash = hashPassword(password, database.salt);
    if (passwordHash !== database.password_hash) {
      return res.status(401).json({ error: 'Invalid master password' });
    }

    // Set as current database
    currentDatabaseId = database.id;

    const groups = db.prepare('SELECT * FROM groups WHERE database_id = ?').all(database.id);
    const entries = db.prepare('SELECT * FROM entries WHERE database_id = ?').all(database.id);
    const tree = buildGroupTree(groups, entries);

    res.json({
      id: database.id,
      name: database.name,
      path: dbPath,
      groups: tree,
      message: 'Database opened successfully'
    });
  } catch (error: any) {
    console.error('Open database error:', error);
    res.status(500).json({ error: error.message || 'Failed to open database' });
  }
});

// GET /api/database - Get current database state
app.get('/api/database', (req, res) => {
  try {
    if (!currentDatabaseId) {
      return res.status(400).json({ error: 'No database is open' });
    }

    const database = db.prepare('SELECT * FROM databases WHERE id = ?').get(currentDatabaseId) as any;

    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }

    const groups = db.prepare('SELECT * FROM groups WHERE database_id = ?').all(currentDatabaseId);
    const entries = db.prepare('SELECT * FROM entries WHERE database_id = ?').all(currentDatabaseId);
    const tree = buildGroupTree(groups, entries);

    res.json({
      id: database.id,
      name: database.name,
      path: dbPath,
      groups: tree
    });
  } catch (error: any) {
    console.error('Get database error:', error);
    res.status(500).json({ error: error.message || 'Failed to get database' });
  }
});

// DELETE /api/database - Close current database
app.delete('/api/database', (req, res) => {
  currentDatabaseId = null;
  res.json({ message: 'Database closed' });
});

// PUT /api/database/master-password - Change master password
app.put('/api/database/master-password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentDatabaseId) {
      return res.status(400).json({ error: 'No database is open' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const database = db.prepare('SELECT * FROM databases WHERE id = ?').get(currentDatabaseId) as any;

    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }

    // Verify current password
    const currentHash = hashPassword(currentPassword, database.salt);
    if (currentHash !== database.password_hash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Generate new salt and hash
    const newSalt = crypto.randomBytes(32).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);

    db.prepare('UPDATE databases SET password_hash = ?, salt = ? WHERE id = ?').run(
      newHash, newSalt, currentDatabaseId
    );

    res.json({ message: 'Master password changed successfully' });
  } catch (error: any) {
    console.error('Change master password error:', error);
    res.status(500).json({ error: error.message || 'Failed to change master password' });
  }
});

// === GROUP ROUTES ===

// POST /api/groups - Create group
app.post('/api/groups', (req, res) => {
  try {
    if (!currentDatabaseId) {
      return res.status(400).json({ error: 'No database is open' });
    }

    const { name, parentId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const id = crypto.randomUUID();
    db.prepare('INSERT INTO groups (id, database_id, parent_id, name) VALUES (?, ?, ?, ?)').run(
      id, currentDatabaseId, parentId || null, name.trim()
    );

    res.json({ id, name: name.trim(), message: 'Group created' });
  } catch (error: any) {
    console.error('Create group error:', error);
    res.status(500).json({ error: error.message || 'Failed to create group' });
  }
});

// PUT /api/groups/:id - Rename group
app.put('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const result = db.prepare('UPDATE groups SET name = ? WHERE id = ?').run(name.trim(), id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group renamed' });
  } catch (error: any) {
    console.error('Rename group error:', error);
    res.status(500).json({ error: error.message || 'Failed to rename group' });
  }
});

// DELETE /api/groups/:id - Delete group
app.delete('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Delete all entries in the group
    db.prepare('DELETE FROM entries WHERE group_id = ?').run(id);

    // Delete subgroups recursively
    const deleteSubgroups = (parentId: string) => {
      const children = db.prepare('SELECT id FROM groups WHERE parent_id = ?').all(parentId) as any[];
      for (const child of children) {
        deleteSubgroups(child.id);
        db.prepare('DELETE FROM entries WHERE group_id = ?').run(child.id);
      }
      db.prepare('DELETE FROM groups WHERE parent_id = ?').run(parentId);
    };
    deleteSubgroups(id);

    // Delete the group itself
    const result = db.prepare('DELETE FROM groups WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group deleted' });
  } catch (error: any) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete group' });
  }
});

// === ENTRY ROUTES ===

// POST /api/entries - Create entry
app.post('/api/entries', (req, res) => {
  try {
    if (!currentDatabaseId) {
      return res.status(400).json({ error: 'No database is open' });
    }

    const { title, username, password, url, notes, groupId } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Entry title is required' });
    }

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO entries (id, database_id, group_id, title, username, password, url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, currentDatabaseId, groupId,
      title.trim(), username || '', password || '', url || '', notes || ''
    );

    res.json({ id, message: 'Entry created' });
  } catch (error: any) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: error.message || 'Failed to create entry' });
  }
});

// PUT /api/entries/:id - Update entry
app.put('/api/entries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, username, password, url, notes } = req.body;

    const fields: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title.trim()); }
    if (username !== undefined) { fields.push('username = ?'); values.push(username); }
    if (password !== undefined) { fields.push('password = ?'); values.push(password); }
    if (url !== undefined) { fields.push('url = ?'); values.push(url); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const result = db.prepare(`UPDATE entries SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry updated' });
  } catch (error: any) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: error.message || 'Failed to update entry' });
  }
});

// DELETE /api/entries/:id - Delete entry
app.delete('/api/entries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM entries WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted' });
  } catch (error: any) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete entry' });
  }
});

// === PASSWORD GENERATOR ===

app.post('/api/password/generate', (req, res) => {
  try {
    const { length = 20, useUppercase = true, useLowercase = true, useNumbers = true, useSpecial = true } = req.body;

    let chars = '';
    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (chars.length === 0) {
      return res.status(400).json({ error: 'At least one character type must be selected' });
    }

    const password = Array.from(crypto.randomFillSync(new Uint8Array(length)))
      .map((byte) => chars[byte % chars.length])
      .join('');

    res.json({ password });
  } catch (error: any) {
    console.error('Generate password error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate password' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
