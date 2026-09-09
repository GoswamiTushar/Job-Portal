import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import { comparePassword, signToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectToDatabase();

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Select password explicitly since it's omitted by default
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email address or password.',
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email address or password.',
            });
        }

        const token = signToken({
            id: user._id.toString(),
            email: user.email,
            userRole: user.userRole,
            name: user.name,
        });

        // Set HttpOnly cookie
        setAuthCookie(res, token);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                userRole: user.userRole,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error during login.',
        });
    }
}
