import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ITERATIONS = 100000;

export interface EncryptedData {
  data: Buffer;
  iv: Buffer;
  salt: Buffer;
  authTag: Buffer;
}

function deriveKeySync(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

export function encrypt(plaintext: string, password: string): EncryptedData {
  const salt = generateSalt();
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKeySync(password, salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return {
    data: encrypted,
    iv,
    salt,
    authTag
  };
}

export function decrypt(encryptedData: EncryptedData, password: string): string {
  const key = deriveKeySync(password, encryptedData.salt);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, encryptedData.iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  
  decipher.setAuthTag(encryptedData.authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encryptedData.data),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
}

export function encryptToBuffer(encrypted: EncryptedData): Buffer {
  return Buffer.concat([
    encrypted.salt,
    encrypted.iv,
    encrypted.authTag,
    encrypted.data
  ]);
}

export function decryptFromBuffer(buffer: Buffer, password: string): string {
  const salt = buffer.slice(0, SALT_LENGTH);
  const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const data = buffer.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  
  return decrypt({ data, iv, salt, authTag }, password);
}
