import type { NextApiRequest, NextApiResponse } from 'next';
import { getWebsiteUrl } from '../../../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const websiteUrl = getWebsiteUrl(req);
    const redirectUri = `${websiteUrl}/api/auth/oauth/google/callback`;

    if (!clientId) {
        return res.status(500).json({
            success: false,
            message: 'GOOGLE_CLIENT_ID is not configured in .env',
        });
    }

    const role = (req.query.role === 'recruiter' ? 'recruiter' : 'candidate');
    const nonce = Math.random().toString(36).substring(2, 10);
    const state = `${role}:${nonce}`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
        state: state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return res.redirect(googleAuthUrl);
}
