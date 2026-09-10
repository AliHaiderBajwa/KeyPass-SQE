import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/schema';
import { encrypt, decrypt, encryptToBuffer, decryptFromBuffer } from '../crypto/encrypt';

const router = Router();

// REQ-1: Create new database
router.post('/new', (req: Request, res: Response) => {
  try {
    const { name, masterKey } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Database name is required' });
    }
    
    const db = getDb();
    const id = crypto.randomUUID();
    
    const initialData = {
      groups: [],
      entries: [],
      settings: {}
    };
    
    // Encrypt is now synchronous
    const encrypted = encrypt(
      JSON.stringify(initialData),
      masterKey.password || ''
    );
    
    const encryptedBuffer = encryptToBuffer(encrypted);
    
    db.prepare(`
      INSERT INTO databases (id, name, requires_key_file, encrypted_data)
      VALUES (?, ?, ?, ?)
    `).run(id, name, masterKey.keyFileContent ? 1 : 0, encryptedBuffer);
    
    const rootGroupId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO groups (id, database_id, parent_id, name)
      VALUES (?, ?, NULL, 'Root')
    `).run(rootGroupId, id);
    
    res.json({ 
      id, 
      name, 
      rootGroupId,
      message: 'Database created successfully' 
    });
  } catch (error) {
    console.error('Create database error:', error);
    res.status(500).json({ error: 'Failed to create database' });
  }
});

// REQ-24/25/26: Authentication - composite key requires BOTH
router.post('/open', (req: Request, res: Response) => {
  try {
    const { databaseId, masterKey } = req.body;
    
    const db = getDb();
    const database = db.prepare(
      'SELECT * FROM databases WHERE id = ?'
    ).get(databaseId) as any;
    
    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }
    
    // REQ-26: If requires_key_file, key file must be provided
    if (database.requires_key_file && !masterKey.keyFileContent) {
      return res.status(401).json({ 
        error: 'Key file required',
        requiresKeyFile: true
      });
    }
    
    // REQ-24: Password required
    if (!masterKey.password) {
      return res.status(401).json({ 
        error: 'Password required',
        requiresPassword: true
      });
    }
    
    // REQ-27: Wrong password = no recovery
    // REQ-28: No backdoor
    // Decrypt is now synchronous
    const decrypted = decryptFromBuffer(
      database.encrypted_data,
      masterKey.password
    );
    
    // Get groups and entries
    const groups = db.prepare(
      'SELECT * FROM groups WHERE database_id = ?'
    ).all(databaseId);
    
    const entries = db.prepare(
      'SELECT * FROM entries WHERE database_id = ?'
    ).all(databaseId);
    
    res.json({
      id: databaseId,
      data: JSON.parse(decrypted),
      groups,
      entries,
      message: 'Database opened successfully'
    });
  } catch (error) {
    console.error('Open database error:', error);
    res.status(401).json({ error: 'Invalid master key' });
  }
});

// Save database
router.post('/save', (req: Request, res: Response) => {
  try {
    const { databaseId, masterKey, data } = req.body;
    
    const db = getDb();
    const database = db.prepare(
      'SELECT * FROM databases WHERE id = ?'
    ).get(databaseId) as any;
    
    if (!database) {
      return res.status(404).json({ error: 'Database not found' });
    }
    
    // Encrypt is now synchronous
    const encrypted = encrypt(
      JSON.stringify(data),
      masterKey.password
    );
    
    const encryptedBuffer = encryptToBuffer(encrypted);
    
    db.prepare(`
      UPDATE databases SET encrypted_data = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(encryptedBuffer, databaseId);
    
    res.json({ message: 'Database saved successfully' });
  } catch (error) {
    console.error('Save database error:', error);
    res.status(500).json({ error: 'Failed to save database' });
  }
});

export default router;
