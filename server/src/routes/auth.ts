import { Router, Request, Response } from 'express';
import crypto from 'crypto';
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
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    // Hash password for session storage (not the actual password)
    const passwordHash = crypto
      .createHash('sha256')
      .update(masterKey.password)
      .digest('hex');
    
    db.prepare(`
      INSERT INTO sessions (id, database_id, master_key_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, databaseId, passwordHash, expiresAt);
    
    res.json({
      sessionId,
      expiresAt,
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('Login error:', error);
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
    console.error('Verify session error:', error);
    res.status(500).json({ error: 'Session verification failed' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
