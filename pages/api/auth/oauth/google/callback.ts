import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import CandidateProfile from '../../../../../models/CandidateProfile';
import RecruiterProfile from '../../../../../models/RecruiterProfile';
import { signToken, setAuthCookie, getWebsiteUrl } from '../../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error } = req.query;

    if (error || !code || typeof code !== 'string') {
        console.error('Google OAuth error:', error);
        return res.redirect('/login?error=google_cancelled');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const websiteUrl = getWebsiteUrl(req);
    const redirectUri = `${websiteUrl}/api/auth/oauth/google/callback`;

    try {
        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId || '',
                client_secret: clientSecret || '',
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error('Failed to obtain Google access token:', tokenData);
            return res.redirect('/login?error=google_token_failed');
        }

        // 2. Fetch User Profile
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profile = await profileResponse.json();

        if (!profile.email) {
            return res.redirect('/login?error=google_email_missing');
        }

        await connectToDatabase();

        const email = profile.email.toLowerCase().trim();
        const name = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'Google User';
        const picture = profile.picture || '';
        const providerId = profile.sub;
        const emailVerified = Boolean(profile.email_verified);
        const hostedDomain = profile.hd || '';
        const locale = profile.locale || '';

        // 3. Determine requested role from state
        const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
        const isRecruiterRequested = stateParam.startsWith('recruiter');
        const assignedRole = isRecruiterRequested ? 0 : 1;

        // 4. Find or Create User with Full Data Retention
        let user = await User.findOne({ email });

        if (!user) {
            // Automatically enrich company details if logging in with Google Workspace domain
            const inferredCompanyName = hostedDomain
                ? hostedDomain.split('.')[0].charAt(0).toUpperCase() + hostedDomain.split('.')[0].slice(1)
                : '';
            const inferredWebsite = hostedDomain ? `https://${hostedDomain}` : '';

            user = await User.create({
                email,
                name,
                avatar: picture,
                authProvider: 'google',
                providerId,
                emailVerified,
                userRole: assignedRole,
                googleProfile: {
                    sub: providerId,
                    hd: hostedDomain,
                    locale,
                },
            });

            if (assignedRole === 0) {
                await RecruiterProfile.create({
                    userId: user._id,
                    companyName: inferredCompanyName,
                    companyWebsite: inferredWebsite,
                    isIndependent: !hostedDomain,
                    isVerified: emailVerified && Boolean(hostedDomain),
                });
            } else {
                await CandidateProfile.create({
                    userId: user._id,
                    skills: [],
                    links: {
                        linkedin: '',
                        github: '',
                        portfolio: '',
                        twitter: '',
                    },
                });
            }
        } else {
            // Retain all existing custom profile data (skills, headline, custom role, etc.)
            if (!user.avatar && picture) user.avatar = picture;
            if (!user.providerId) user.providerId = providerId;
            if (!user.emailVerified && emailVerified) user.emailVerified = true;
            user.googleProfile = {
                sub: providerId,
                hd: hostedDomain,
                locale,
            };
            user.authProvider = 'google';
            await user.save();
        }

        // 5. Generate JWT & Set HttpOnly Cookie
        const token = signToken({
            id: user._id.toString(),
            email: user.email,
            userRole: user.userRole,
            name: user.name,
        });

        setAuthCookie(res, token);

        const destination = user.userRole === 0 ? '/postedjobs?oauth=success' : '/dashboard?oauth=success';
        return res.redirect(destination);
    } catch (err: any) {
        console.error('Google OAuth processing error:', err);
        return res.redirect('/login?error=google_auth_error');
    }
}
