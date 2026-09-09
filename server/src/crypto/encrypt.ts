import { deriveKey, generateSalt } from './keyDerivation';

export interface EncryptedData {
  data: Uint8Array;
  iv: Uint8Array;
  salt: Uint8Array;
}

export async function encrypt(
  plaintext: string,
  password: string
): Promise<EncryptedData> {
  const salt = generateSalt();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return {
    data: new Uint8Array(encrypted),
    iv,
    salt
  };
}

export async function decrypt(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  const key = await deriveKey(password, encryptedData.salt);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: encryptedData.iv },
    key,
    encryptedData.data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export function encryptToBuffer(encrypted: EncryptedData): Buffer {
  const combined = new Uint8Array(
    encrypted.salt.length + encrypted.iv.length + encrypted.data.length
  );
  combined.set(encrypted.salt, 0);
  combined.set(encrypted.iv, encrypted.salt.length);
  combined.set(encrypted.data, encrypted.salt.length + encrypted.iv.length);
  return Buffer.from(combined);
}

export function decryptFromBuffer(
  buffer: Buffer,
  password: string
): Promise<string> {
  const salt = new Uint8Array(buffer.slice(0, 16));
  const iv = new Uint8Array(buffer.slice(16, 28));
  const data = new Uint8Array(buffer.slice(28));
  
  return decrypt({ data, iv, salt }, password);
}
