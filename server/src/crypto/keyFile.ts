import crypto from 'crypto';

export interface KeyFile {
  id: string;
  content: string;
  createdAt: string;
}

export function generateKeyFile(): KeyFile {
  const id = crypto.randomUUID();
  const randomBytes = crypto.randomBytes(32);
  const content = randomBytes.toString('hex');
  
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
