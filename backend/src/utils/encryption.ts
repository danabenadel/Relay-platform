import crypto from 'crypto';

const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = crypto.createHash('sha256')
  .update(String(ENCRYPTION_KEY_RAW))
  .digest();

export class EncryptionUtil {
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt token');
    }
  }
}