import { describe, expect, it } from 'vitest';
import { generateTempPassword, hashPassword, verifyPassword } from './password';

describe('passwords', () => {
  it('generates readable temporary passwords', () => {
    const p = generateTempPassword();
    expect(p).toHaveLength(10);
    expect(p).not.toMatch(/[0O1lI]/);
  });

  it('verifies a hashed password', async () => {
    const hash = await hashPassword('секретный-пароль');
    expect(await verifyPassword('секретный-пароль', hash)).toBe(true);
    expect(await verifyPassword('другой', hash)).toBe(false);
  });
});
