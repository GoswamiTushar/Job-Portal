import type { NextApiRequest, NextApiResponse } from 'next';
import { getWebsiteUrl, authenticateRequest } from '../../../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const isConfigMissing = !clientId || clientId.startsWith('your_') || clientId.trim() === '';
    const websiteUrl = getWebsiteUrl(req);
    const redirectUri = `${websiteUrl}/api/auth/oauth/linkedin/callback`;

    const isSyncAction = req.query.action === 'sync';
    const nonce = Math.random().toString(36).substring(2, 12);

    // If candidate is connecting/syncing their LinkedIn account from /profile
    if (isSyncAction) {
        const user = authenticateRequest(req);
        if (!user) {
            return res.redirect('/login?redirect=/profile');
        }

        if (isConfigMissing) {
            return res.redirect('/profile?linkedin_error=config_missing');
        }

        const state = `sync:${user.id}:${nonce}`;
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            state: state,
            scope: 'openid profile email',
        });

        return res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
    }

    // Standard OAuth Login / Register Flow
    if (isConfigMissing) {
        return res.redirect('/login?error=linkedin_config_missing');
    }

    const role = (req.query.role === 'recruiter' ? 'recruiter' : 'candidate');
    const state = `${role}:${nonce}`;

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state,
        scope: 'openid profile email',
    });

    return res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
}

