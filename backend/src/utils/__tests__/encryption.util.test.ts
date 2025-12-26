import { EncryptionUtil } from '../encryption';

describe('EncryptionUtil', () => {
  it('encrypts and decrypts symmetrically', () => {
    const plainText = 'sensitive-token-value';

    const encrypted = EncryptionUtil.encrypt(plainText);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(plainText);

    const decrypted = EncryptionUtil.decrypt(encrypted);
    expect(decrypted).toBe(plainText);
  });

  it('throws when decrypting malformed payloads', () => {
    expect(() => EncryptionUtil.decrypt('invalid:data')).toThrow('Failed to decrypt token');
  });
});
