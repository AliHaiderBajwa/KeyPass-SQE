import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/schema';

const router = Router();

// REQ-11: Entry must belong to group
router.post('/add', (req: Request, res: Response) => {
  try {
    const { databaseId, groupId, title, username, password, url, notes } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: 'Entry must belong to a group (REQ-11)' });
    }
    
    // REQ-12, REQ-13: Password validation handled in client
    // REQ-14: Not all fields required (SRS Section 3.10.1)
    
    const db = getDb();
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO entries (id, database_id, group_id, title, username, password, url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, databaseId, groupId, title || '', username || '', password || '', url || '', notes || '');
    
    res.json({ id, message: 'Entry created successfully' });
  } catch (error) {
    console.error('Create entry error:', error);
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
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Failed to get entry' });
  }
});

// REQ-15: When password changed, repeat must match (client-side validation)
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
    console.error('Update entry error:', error);
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
    
    const newId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO entries (id, database_id, group_id, title, username, password, url, notes, is_tan, tan_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId, 
      entry.database_id, 
      entry.group_id, 
      `${entry.title} (Copy)`, 
      entry.username, 
      entry.password, 
      entry.url, 
      entry.notes,
      entry.is_tan,
      entry.tan_used
    );
    
    res.json({ id: newId, message: 'Entry duplicated successfully' });
  } catch (error) {
    console.error('Duplicate entry error:', error);
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
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Get all entries for a database
router.get('/database/:databaseId', (req: Request, res: Response) => {
  try {
    const { databaseId } = req.params;
    
    const db = getDb();
    const entries = db.prepare(
      'SELECT * FROM entries WHERE database_id = ?'
    ).all(databaseId);
    
    res.json({ entries });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Failed to get entries' });
  }
});

export default router;
