import crypto from 'crypto';

const ITERATIONS = 100000;
const KEY_LENGTH = 32;

export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

export function generateSalt(): Buffer {
  return crypto.randomBytes(16);
}
