import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/schema';

const router = Router();

// Generate random TAN (8-character alphanumeric)
function generateTanValue(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(crypto.randomBytes(8))
    .map(byte => chars[byte % chars.length])
    .join('');
}

// Create TAN entries via wizard
router.post('/create', (req: Request, res: Response) => {
  try {
    const { databaseId, groupId, count = 10 } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID required' });
    }
    
    const db = getDb();
    const tans: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const id = crypto.randomUUID();
      const tan = generateTanValue();
      
      // REQ-32: TAN title must be "<TAN>"
      // Store TAN value in password field
      db.prepare(`
        INSERT INTO entries (id, database_id, group_id, title, username, password, url, notes, is_tan, tan_used)
        VALUES (?, ?, ?, ?, '', ?, '', '', 1, 0)
      `).run(id, databaseId, groupId, '<TAN>', tan);
      
      tans.push({ id, tan });
    }
    
    res.json({ tans, message: `${count} TANs created` });
  } catch (error) {
    console.error('Create TANs error:', error);
    res.status(500).json({ error: 'Failed to create TANs' });
  }
});

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
      tan: entry.password
    });
  } catch (error) {
    console.error('Use TAN error:', error);
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
    console.error('Get TAN error:', error);
    res.status(500).json({ error: 'Failed to get TAN' });
  }
});

// Get all TANs for a group
router.get('/group/:groupId', (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    
    const db = getDb();
    const tans = db.prepare(
      'SELECT * FROM entries WHERE group_id = ? AND is_tan = 1'
    ).all(groupId);
    
    res.json({ tans });
  } catch (error) {
    console.error('Get TANs error:', error);
    res.status(500).json({ error: 'Failed to get TANs' });
  }
});

export default router;
