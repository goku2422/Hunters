import { db } from './db';
import { Merchant, AdminUser } from '../types';

export interface AuthSession {
  type: 'merchant' | 'admin';
  id: string;
  email: string;
  name: string;
  shopId?: string;
  shopName?: string;
}

export function createToken(session: AuthSession): string {
  const json = JSON.stringify({
    ...session,
    ts: Date.now(),
  });
  return Buffer.from(json).toString('base64');
}

export function verifyToken(tokenString?: string | null): AuthSession | null {
  if (!tokenString) return null;
  try {
    const raw = Buffer.from(tokenString, 'base64').toString('utf-8');
    const data = JSON.parse(raw) as AuthSession & { ts: number };
    // Validate session age (e.g. 7 days)
    if (Date.now() - data.ts > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return {
      type: data.type,
      id: data.id,
      email: data.email,
      name: data.name,
      shopId: data.shopId,
      shopName: data.shopName,
    };
  } catch {
    return null;
  }
}
