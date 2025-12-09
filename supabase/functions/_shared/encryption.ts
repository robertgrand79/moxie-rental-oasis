// Simple encryption utilities for API keys at rest
// Uses AES-GCM with a key derived from the ENCRYPTION_KEY secret

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

async function getEncryptionKey(): Promise<CryptoKey> {
  const secretKey = Deno.env.get('ENCRYPTION_KEY');
  if (!secretKey) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }
  
  // Derive a key from the secret using PBKDF2
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('api-key-encryption-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH * 8 },
    key,
    encoder.encode(plaintext)
  );
  
  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptApiKey(ciphertext: string): Promise<string> {
  if (!ciphertext) return '';
  
  try {
    const key = await getEncryptionKey();
    
    // Decode base64 and split IV from ciphertext
    const combined = new Uint8Array(
      atob(ciphertext).split('').map(c => c.charCodeAt(0))
    );
    
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH * 8 },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return '';
  }
}

// Helper to check if a string is encrypted (base64 of sufficient length)
export function isEncrypted(value: string): boolean {
  if (!value || value.length < 32) return false;
  try {
    atob(value);
    return true;
  } catch {
    return false;
  }
}
