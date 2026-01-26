import bcrypt from 'bcryptjs'

// 10 rounds: ~100ms verify; buen equilibrio seguridad/UX. 12 rondas → 300–500ms en login.
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
