import { ValidationUtil } from '../validation';

describe('ValidationUtil', () => {
  it('accepts valid email formats', () => {
    expect(ValidationUtil.isValidEmail('user@example.com')).toBe(true);
    expect(ValidationUtil.isValidEmail('john.doe+alias@sub.domain.co')).toBe(true);
  });

  it('rejects invalid email formats', () => {
    expect(ValidationUtil.isValidEmail('invalid-email')).toBe(false);
    expect(ValidationUtil.isValidEmail('user@')).toBe(false);
  });

  it('accepts strong passwords', () => {
    expect(ValidationUtil.isValidPassword('StrongPass1')).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(ValidationUtil.isValidPassword('short')).toBe(false);
    expect(ValidationUtil.isValidPassword('nouppercase1')).toBe(false);
    expect(ValidationUtil.isValidPassword('NOLOWERCASE1')).toBe(false);
    expect(ValidationUtil.isValidPassword('NoDigitsHere')).toBe(false);
  });

  it('sanitizes strings by trimming and lowercasing', () => {
    expect(ValidationUtil.sanitizeString('  TEST@Example.Com  ')).toBe('test@example.com');
  });
});
