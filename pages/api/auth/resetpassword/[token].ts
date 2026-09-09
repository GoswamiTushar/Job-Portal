import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../../lib/mongodb';
import ResetToken from '../../../../models/ResetToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectToDatabase();

        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Token parameter is required.',
            });
        }

        const resetRecord = await ResetToken.findOne({ token });

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Token is valid.',
            data: {
                email: resetRecord.email,
            },
        });
    } catch (error: any) {
        console.error('Verify token error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error verifying token.',
        });
    }
}
