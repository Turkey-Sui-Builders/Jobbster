// Resume viewer utility for decrypting and viewing encrypted resumes
import { downloadFromWalrus, decryptWithAes, decryptKeyWithSeal } from './encryption';

/**
 * Download and decrypt resume from Walrus
 */
export async function viewEncryptedResume(
  resumeLink: string,
  encryptedKeyBytes: Uint8Array,
  jobId: string
): Promise<Blob> {
  try {
    // Check if it's a Walrus link
    if (!resumeLink.startsWith('walrus://')) {
      throw new Error('Not an encrypted Walrus resume');
    }

    // Extract blob ID
    const blobId = resumeLink.replace('walrus://', '');

    // 1. Download encrypted blob from Walrus
    const encryptedBlob = await downloadFromWalrus(blobId);

    // 2. Decrypt the symmetric key using Seal
    const symmetricKey = await decryptKeyWithSeal(encryptedKeyBytes, jobId);

    // 3. Decrypt the file using AES
    const decryptedArrayBuffer = await decryptWithAes(encryptedBlob, symmetricKey);

    // 4. Return as Blob
    return new Blob([decryptedArrayBuffer], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error viewing encrypted resume:', error);
    throw error;
  }
}

/**
 * Open resume in new tab (handles both encrypted and direct links)
 */
export async function openResume(
  resumeLink: string,
  encryptedKey?: string,
  jobId?: string
): Promise<void> {
  try {
    if (resumeLink.startsWith('walrus://') && encryptedKey && jobId) {
      // Encrypted resume - decrypt and open
      const encryptedKeyBytes = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
      const decryptedBlob = await viewEncryptedResume(resumeLink, encryptedKeyBytes, jobId);
      const url = URL.createObjectURL(decryptedBlob);
      window.open(url, '_blank');
      
      // Clean up after 1 minute
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else {
      // Direct link - open normally
      window.open(resumeLink, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('Error opening resume:', error);
    alert('Failed to open resume. Please try again.');
  }
}
