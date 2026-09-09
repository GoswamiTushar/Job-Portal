import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthCookie } from '../../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    clearAuthCookie(res);

    return res.status(200).json({
        success: true,
        message: 'You have successfully logged out.',
    });
}
