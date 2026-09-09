import { Router, Request, Response } from 'express';
import crypto from 'crypto';
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
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO groups (id, database_id, parent_id, name)
      VALUES (?, ?, ?, ?)
    `).run(id, databaseId, parentId, name);
    
    res.json({ id, name, parentId, message: 'Group created successfully' });
  } catch (error) {
    console.error('Create group error:', error);
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
    console.error('Rename group error:', error);
    res.status(500).json({ error: 'Failed to rename group' });
  }
});

// Delete group with confirmation
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
    console.error('Delete group error:', error);
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
    console.error('Find in group error:', error);
    res.status(500).json({ error: 'Failed to search group' });
  }
});

// Get all groups for a database
router.get('/:databaseId', (req: Request, res: Response) => {
  try {
    const { databaseId } = req.params;
    
    const db = getDb();
    const groups = db.prepare(
      'SELECT * FROM groups WHERE database_id = ?'
    ).all(databaseId);
    
    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

export default router;
