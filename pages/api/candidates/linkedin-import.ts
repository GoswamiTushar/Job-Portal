import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Deprecated: LinkedIn details are now fetched securely via LinkedIn OAuth 2.0
    return res.status(410).json({
        success: false,
        message: 'Direct text/link import is deprecated. Please use LinkedIn OAuth 2.0 via /api/auth/oauth/linkedin?action=sync.',
    });
}

