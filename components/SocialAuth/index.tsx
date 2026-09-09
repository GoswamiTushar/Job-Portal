import React, { FC } from 'react';
import styles from './styles.module.scss';

interface SocialAuthProps {
    mode?: 'login' | 'signup';
    isCandidate?: boolean;
    role?: 'candidate' | 'recruiter';
}

const SocialAuth: FC<SocialAuthProps> = ({ mode = 'login', isCandidate = true, role }) => {
    // If role is explicitly provided, use it; otherwise infer from isCandidate
    const effectiveRole = role || (isCandidate ? 'candidate' : 'recruiter');
    const isRecruiter = effectiveRole === 'recruiter';

    const handleLinkedInLogin = () => {
        // Full page redirect needed to initiate external OAuth flow with role state
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/api/auth/oauth/linkedin?role=${effectiveRole}`;
    };

    const handleGoogleLogin = () => {
        // Full page redirect needed to initiate external OAuth flow with role state
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/api/auth/oauth/google?role=${effectiveRole}`;
    };

    const actionText = mode === 'signup' ? 'Sign up' : 'Continue';
    const badgeText = isRecruiter ? '⭐ FAST-TRACK FOR RECRUITERS' : '⭐ PREFERRED FOR CANDIDATES';
    const linkedinTooltip = isRecruiter
        ? 'Sign in with LinkedIn for instant recruiter verification and profile sync'
        : 'Sign in with LinkedIn to instantly sync your candidate details';

    return (
        <div className={styles['social-auth-container']}>
            <div className={styles['preferred-wrapper']}>
                <div className={styles['preferred-badge']}>
                    <span>{badgeText}</span>
                </div>
                <button
                    type="button"
                    className={`${styles['social-btn']} ${styles['linkedin-btn']}`}
                    onClick={handleLinkedInLogin}
                    title={linkedinTooltip}
                >
                    <svg className={styles['icon']} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>{actionText} with LinkedIn</span>
                </button>
            </div>

            <button
                type="button"
                className={`${styles['social-btn']} ${styles['google-btn']}`}
                onClick={handleGoogleLogin}
            >
                <svg className={styles['icon']} viewBox="0 0 48 48" width="20" height="20">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                <span>{actionText} with Google</span>
            </button>

            <div className={styles['divider']}>
                <div className={styles['line']}></div>
                <span className={styles['text']}>or continue with email</span>
                <div className={styles['line']}></div>
            </div>
        </div>
    );
};

export default SocialAuth;
