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
  
  // Check for orphaned groups (parent group doesn't exist)
  const orphanedGroups = db.prepare(`
    SELECT g.id FROM groups g
    LEFT JOIN groups p ON g.parent_id = p.id
    WHERE g.parent_id IS NOT NULL AND p.id IS NULL
  `).all();
  
  if (orphanedGroups.length > 0) {
    errors.push(`Found ${orphanedGroups.length} orphaned groups`);
  }
  
  // Check for orphaned entries (group doesn't exist)
  const orphanedEntries = db.prepare(`
    SELECT e.id FROM entries e
    LEFT JOIN groups g ON e.group_id = g.id
    WHERE g.id IS NULL
  `).all();
  
  if (orphanedEntries.length > 0) {
    errors.push(`Found ${orphanedEntries.length} orphaned entries`);
  }
  
  // Check for TAN entries without TAN value
  const tanWithoutValue = db.prepare(`
    SELECT e.id FROM entries e
    WHERE e.is_tan = 1 AND (e.password = '' OR e.password IS NULL)
  `).all();
  
  if (tanWithoutValue.length > 0) {
    errors.push(`Found ${tanWithoutValue.length} TANs without value`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Create backup before save
export function createBackup(databaseId: string): string | null {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(
      backupDir,
      `backup-${databaseId}-${Date.now()}.db`
    );
    
    const dbPath = path.join(process.cwd(), 'data', 'keepass.db');
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupFile);
    }
    
    return backupFile;
  } catch (error) {
    console.error('Backup failed:', error);
    return null;
  }
}

// Repair database by removing orphaned records
export function repairDatabase(databaseId: string): {
  repaired: boolean;
  actions: string[];
} {
  const db = getDb();
  const actions: string[] = [];
  
  // Remove orphaned entries
  const result = db.prepare(`
    DELETE FROM entries WHERE group_id NOT IN (
      SELECT id FROM groups WHERE database_id = ?
    )
  `).run(databaseId);
  
  if (result.changes > 0) {
    actions.push(`Removed ${result.changes} orphaned entries`);
  }
  
  // Remove orphaned groups (except root)
  const groupResult = db.prepare(`
    DELETE FROM groups WHERE database_id = ? 
    AND parent_id IS NOT NULL 
    AND parent_id NOT IN (SELECT id FROM groups WHERE database_id = ?)
  `).run(databaseId, databaseId);
  
  if (groupResult.changes > 0) {
    actions.push(`Removed ${groupResult.changes} orphaned groups`);
  }
  
  return {
    repaired: actions.length > 0,
    actions
  };
}
