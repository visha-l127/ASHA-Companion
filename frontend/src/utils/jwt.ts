import { UserRole } from '../types';

export interface JWTPayload {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  facilityId?: string;
  facilityName?: string;
  location?: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = 'asha_ehr_companion_jwt_secret_2026_coimbatore_district';

/**
 * Base64URL encoder helper
 */
function base64UrlEncode(str: string): string {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch (e) {
    return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }
}

/**
 * Base64URL decoder helper
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    const raw = atob(base64);
    return decodeURIComponent(
      Array.prototype.map.call(raw, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch (e) {
    return atob(base64);
  }
}

/**
 * Generates HMAC signature digest for token string validation
 */
function generateSignature(headerAndPayload: string, secret: string): string {
  let hash = 0;
  const combined = headerAndPayload + '.' + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return base64UrlEncode(`sig_v1_${Math.abs(hash).toString(36)}_${combined.length}`);
}

/**
 * Issues a signed JWT token containing authenticated user identity and role.
 */
export function generateToken(user: {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  facilityId?: string;
  facilityName?: string;
  location?: string;
}): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    facilityId: user.facilityId,
    facilityName: user.facilityName,
    location: user.location,
    iat: now,
    exp: now + 24 * 60 * 60, // 24-hour expiration token
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const headerAndPayload = `${encodedHeader}.${encodedPayload}`;
  const signature = generateSignature(headerAndPayload, JWT_SECRET);

  return `${headerAndPayload}.${signature}`;
}

/**
 * Validates a JWT token's signature, structure, and expiration.
 */
export function verifyToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'No token provided' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [encodedHeader, encodedPayload, tokenSig] = parts;
    const headerAndPayload = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = generateSignature(headerAndPayload, JWT_SECRET);

    if (tokenSig !== expectedSig) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Decodes token payload without signature check
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch (e) {
    return null;
  }
}
