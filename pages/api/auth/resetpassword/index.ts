import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';
import ResetToken from '../../../../models/ResetToken';
import { hashPassword } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();

    // GET /api/auth/resetpassword?email=... -> Generates reset token
    if (req.method === 'GET') {
        const { email } = req.query;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Email query parameter is required.',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address.',
            });
        }

        // Generate a cryptographically secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

        // Delete any prior active tokens for this email
        await ResetToken.deleteMany({ email: normalizedEmail });

        await ResetToken.create({
            token,
            email: normalizedEmail,
            expiresAt,
        });

        return res.status(200).json({
            success: true,
            message: 'Reset token generated successfully.',
            data: { token },
        });
    }

    // POST /api/auth/resetpassword -> Sets new password
    if (req.method === 'POST') {
        const { password, token } = req.body;

        if (!password || !token) {
            return res.status(400).json({
                success: false,
                message: 'Password and reset token are required.',
            });
        }

        const resetRecord = await ResetToken.findOne({ token });

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token.',
            });
        }

        const hashedPassword = await hashPassword(password);

        await User.findOneAndUpdate(
            { email: resetRecord.email },
            { password: hashedPassword }
        );

        // Delete token once used
        await ResetToken.deleteOne({ _id: resetRecord._id });

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully.',
        });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}
