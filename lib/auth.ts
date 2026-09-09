import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const COOKIE_NAME = process.env.COOKIE_NAME || 'auth_token';

export interface TokenPayload {
    id: string;
    email: string;
    userRole: number; // 0 = Recruiter, 1 = Candidate
    name: string;
}

export interface AuthenticatedNextApiRequest extends NextApiRequest {
    user?: TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
}

export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyJwtToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}

export function setAuthCookie(res: NextApiResponse, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const secureFlag = isProduction ? '; Secure' : '';
    const cookie = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
    res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res: NextApiResponse) {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? '; Secure' : '';
    const cookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
    res.setHeader('Set-Cookie', cookie);
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
    // 1. Check HttpOnly cookie first
    if (req.cookies && req.cookies[COOKIE_NAME]) {
        return req.cookies[COOKIE_NAME] || null;
    }

    // 2. Check Authorization Bearer header as fallback
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    if (authHeader) {
        return authHeader.trim();
    }

    return null;
}

export function authenticateRequest(req: NextApiRequest): TokenPayload | null {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    return verifyJwtToken(token);
}

export function withAuth(
    handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => Promise<any> | any,
    options: { requiredRole?: number } = {}
) {
    return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
        const user = authenticateRequest(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login to continue.',
            });
        }

        if (options.requiredRole !== undefined && user.userRole !== options.requiredRole) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You do not have permission to access this resource.',
            });
        }

        req.user = user;
        return handler(req, res);
    };
}

export function getWebsiteUrl(req: NextApiRequest): string {
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    if (process.env.NEXT_PUBLIC_WEBSITE_URL && process.env.NEXT_PUBLIC_WEBSITE_URL !== 'http://localhost:3000') {
        return process.env.NEXT_PUBLIC_WEBSITE_URL.replace(/\/+$/, '');
    }
    return host ? `${protocol}://${host}` : 'http://localhost:3000';
}
