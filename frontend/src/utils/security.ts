import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using BCrypt.
 */
export function hashPassword(plainText: string): string {
  if (!plainText) return '';
  return bcrypt.hashSync(plainText, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored BCrypt hash or legacy plaintext string.
 */
export function verifyPassword(plainText: string, storedHashOrPlain?: string | null): boolean {
  if (!plainText || !storedHashOrPlain) {
    return false;
  }

  // Check if stored value is a BCrypt hash
  if (
    storedHashOrPlain.startsWith('$2a$') ||
    storedHashOrPlain.startsWith('$2b$') ||
    storedHashOrPlain.startsWith('$2y$')
  ) {
    try {
      return bcrypt.compareSync(plainText, storedHashOrPlain);
    } catch (e) {
      console.error('Error comparing bcrypt password', e);
      return false;
    }
  }

  // Fallback for legacy unhashed values (migrates gracefully)
  return plainText === storedHashOrPlain;
}

/**
 * Generates a random secure temporary password meeting complexity criteria.
 */
export function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const nums = '23456789';
  const spec = '@#$!';

  const getRandom = (str: string) => str.charAt(Math.floor(Math.random() * str.length));

  return `${getRandom(upper)}${getRandom(lower)}${getRandom(lower)}${getRandom(nums)}${getRandom(nums)}${getRandom(spec)}${getRandom(upper)}${getRandom(nums)}`;
}

