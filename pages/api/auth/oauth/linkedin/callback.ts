import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import CandidateProfile from '../../../../../models/CandidateProfile';
import RecruiterProfile from '../../../../../models/RecruiterProfile';
import { signToken, setAuthCookie, getWebsiteUrl } from '../../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error, error_description } = req.query;
    const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
    const isSyncAction = stateParam.startsWith('sync:');

    if (error || !code || typeof code !== 'string') {
        console.error('LinkedIn OAuth error:', error, error_description);
        if (isSyncAction) {
            return res.redirect('/profile?linkedin_error=cancelled');
        }
        return res.redirect('/login?error=linkedin_cancelled');
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const websiteUrl = getWebsiteUrl(req);
    const redirectUri = `${websiteUrl}/api/auth/oauth/linkedin/callback`;

    try {
        // 1. Exchange authorization code for access token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId || '',
                client_secret: clientSecret || '',
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error('Failed to obtain LinkedIn access token:', tokenData);
            if (isSyncAction) {
                return res.redirect('/profile?linkedin_error=token_failed');
            }
            return res.redirect('/login?error=linkedin_token_failed');
        }

        // 2. Fetch User Profile via LinkedIn OIDC Userinfo endpoint
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profile = await profileResponse.json();

        if (!profile || (!profile.sub && !profile.email)) {
            if (isSyncAction) {
                return res.redirect('/profile?linkedin_error=profile_fetch_failed');
            }
            return res.redirect('/login?error=linkedin_profile_missing');
        }

        await connectToDatabase();

        const email = (profile.email || '').toLowerCase().trim();
        const name =
            profile.name ||
            `${profile.given_name || ''} ${profile.family_name || ''}`.trim() ||
            'LinkedIn User';
        const picture = profile.picture || '';
        const providerId = profile.sub || '';
        const locale =
            typeof profile.locale === 'object'
                ? JSON.stringify(profile.locale)
                : profile.locale || '';

        // 3. Handle Candidate Profile Sync Flow
        if (isSyncAction) {
            const targetUserId = stateParam.split(':')[1];
            let targetUser = targetUserId ? await User.findById(targetUserId) : null;

            if (!targetUser && email) {
                targetUser = await User.findOne({ email });
            }

            if (!targetUser) {
                return res.redirect('/profile?linkedin_error=user_not_found');
            }

            // Update user linkedInProfile details
            targetUser.linkedInProfile = {
                sub: providerId,
                name,
                picture,
                locale,
            };

            if (!targetUser.avatar && picture) {
                targetUser.avatar = picture;
            }
            await targetUser.save();

            // Update or initialize CandidateProfile
            let candidateProfile = await CandidateProfile.findOne({ userId: targetUser._id });
            if (!candidateProfile) {
                candidateProfile = await CandidateProfile.create({
                    userId: targetUser._id,
                    skills: [],
                    links: {
                        linkedin: `https://www.linkedin.com/in/${providerId}`,
                        github: '',
                        portfolio: '',
                        twitter: '',
                    },
                });
            } else {
                if (!candidateProfile.links.linkedin) {
                    candidateProfile.links.linkedin = `https://www.linkedin.com/in/${providerId}`;
                }
                await candidateProfile.save();
            }

            return res.redirect('/profile?linkedin=synced');
        }

        // 4. Handle Standard LinkedIn OAuth Login / Signup Flow
        const isRecruiterRequested = stateParam.startsWith('recruiter');
        const assignedRole = isRecruiterRequested ? 0 : 1;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                avatar: picture,
                authProvider: 'linkedin',
                providerId,
                emailVerified: Boolean(profile.email_verified),
                userRole: assignedRole,
                linkedInProfile: {
                    sub: providerId,
                    name,
                    picture,
                    locale,
                },
            });

            // Initialize respective modular profile
            if (assignedRole === 0) {
                await RecruiterProfile.create({
                    userId: user._id,
                    companyName: '',
                    isIndependent: true,
                });
            } else {
                await CandidateProfile.create({
                    userId: user._id,
                    skills: [],
                    links: {
                        linkedin: `https://www.linkedin.com/in/${providerId}`,
                        github: '',
                        portfolio: '',
                        twitter: '',
                    },
                });
            }
        } else {
            // Update profile metadata if missing
            if (!user.avatar && picture) user.avatar = picture;
            if (!user.providerId) user.providerId = providerId;
            user.linkedInProfile = {
                sub: providerId,
                name,
                picture,
                locale,
            };
            user.authProvider = 'linkedin';
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

        // Redirect based on role
        const destination =
            user.userRole === 0 ? '/postedjobs?oauth=success' : '/profile?welcome=true';
        return res.redirect(destination);
    } catch (err: any) {
        console.error('LinkedIn OAuth processing error:', err);
        if (isSyncAction) {
            return res.redirect('/profile?linkedin_error=auth_error');
        }
        return res.redirect('/login?error=linkedin_auth_error');
    }
}

