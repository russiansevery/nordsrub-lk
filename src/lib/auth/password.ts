import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';

export const MIN_PASSWORD_LENGTH = 8;

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// Без похожих символов (0/O, 1/l/I), чтобы временный пароль было легко ввести с телефона.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateTempPassword(length = 10) {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
