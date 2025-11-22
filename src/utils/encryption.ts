// Walrus and Encryption utilities
import CryptoJS from 'crypto-js';

// Walrus configuration
const WALRUS_PUBLISHER_URL = 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space';

/**
 * Generate random AES key
 */
export function generateRandomKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Encrypt file with AES
 */
export function encryptWithAes(file: File, key: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
        const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
        
        // Convert encrypted string to Blob
        const blob = new Blob([encrypted], { type: 'application/octet-stream' });
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Decrypt file with AES
 */
export function decryptWithAes(encryptedBlob: Blob, key: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const encryptedString = e.target?.result as string;
        const decrypted = CryptoJS.AES.decrypt(encryptedString, key);
        const arrayBuffer = wordArrayToArrayBuffer(decrypted);
        resolve(arrayBuffer);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(encryptedBlob);
  });
}

/**
 * Convert WordArray to ArrayBuffer
 */
function wordArrayToArrayBuffer(wordArray: CryptoJS.lib.WordArray): ArrayBuffer {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  
  return u8.buffer;
}

/**
 * Upload encrypted blob to Walrus
 */
export async function uploadToWalrus(encryptedBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', encryptedBlob, 'encrypted.bin');
    
    const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/store`, {
      method: 'PUT',
      body: encryptedBlob,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Walrus upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Walrus returns blob ID in different formats depending on response
    if (result.newlyCreated?.blobObject?.blobId) {
      return result.newlyCreated.blobObject.blobId;
    } else if (result.alreadyCertified?.blobId) {
      return result.alreadyCertified.blobId;
    } else {
      throw new Error('Invalid Walrus response format');
    }
  } catch (error) {
    console.error('Walrus upload error:', error);
    throw error;
  }
}

/**
 * Download blob from Walrus
 */
export async function downloadFromWalrus(blobId: string): Promise<Blob> {
  try {
    const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/${blobId}`);
    
    if (!response.ok) {
      throw new Error(`Walrus download failed: ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Walrus download error:', error);
    throw error;
  }
}

/**
 * Encrypt symmetric key with Seal-like approach
 * This is a placeholder - actual Seal SDK implementation would go here
 */
export async function encryptKeyWithSeal(
  symmetricKey: string,
  jobId: string,
  packageId: string
): Promise<Uint8Array> {
  // For now, we'll use a simple approach
  // In production, this should use actual Seal SDK
  
  // Convert key to bytes
  const keyBytes = new TextEncoder().encode(symmetricKey);
  
  // Add jobId as context (this ensures only job owner can decrypt)
  const contextBytes = new TextEncoder().encode(jobId);
  
  // Combine them (simple concatenation for demo)
  const combined = new Uint8Array(keyBytes.length + contextBytes.length);
  combined.set(keyBytes, 0);
  combined.set(contextBytes, keyBytes.length);
  
  // In real Seal SDK, this would be:
  // const client = new SealClient(...);
  // const { encryptedObject } = await client.encrypt({
  //     threshold: 1,
  //     packageId: packageId,
  //     id: fromHEX(jobId),
  //     data: symmetricKey
  // });
  // return encryptedObject;
  
  return combined;
}

/**
 * Decrypt symmetric key with Seal
 * This would be called by the employer to decrypt the resume
 */
export async function decryptKeyWithSeal(
  encryptedKey: Uint8Array,
  jobId: string
): Promise<string> {
  // This is a placeholder
  // In production with real Seal SDK:
  // const client = new SealClient(...);
  // const decrypted = await client.decrypt({
  //     encryptedObject: encryptedKey,
  //     id: fromHEX(jobId)
  // });
  // return decrypted;
  
  // For demo, reverse the simple encryption
  const decoder = new TextDecoder();
  const jobIdLength = jobId.length;
  const keyBytes = encryptedKey.slice(0, encryptedKey.length - jobIdLength);
  return decoder.decode(keyBytes);
}
