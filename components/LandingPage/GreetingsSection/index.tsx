import React, { FC, useContext } from 'react';
import Link from 'next/link';
import { authContext } from '../../../pages/_app';
import Hero3D from '../Hero3D';
import styles from './styles.module.scss';

const GreetingsSection: FC = () => {
    const isAuth = useContext(authContext);
    const isRecruiter = typeof window !== 'undefined' && localStorage.getItem('sb-userRole') === '0';

    return (
        <section className={styles['greetings-section']}>
            <div className={styles['hero-content']}>
                <div className={styles['badge-pill']}>
                    <span className={styles['live-dot']} />
                    <span>NEXT-GEN VERIFIED JOB PLATFORM</span>
                </div>

                <h1 className={styles['hero-title']}>
                    Find verified jobs. <br />
                    <span className={styles['gradient-text']}>Direct recruiter sync.</span>
                </h1>

                <p className={styles['hero-description']}>
                    Skip outdated job directories. Connect directly with active hiring teams,
                    auto-sync your verified candidate profile with 1-click Google or LinkedIn sign-in,
                    and discover roles with transparent compensation bands.
                </p>

                <div className={styles['cta-group']}>
                    <Link
                        className={styles['primary-cta']}
                        href={
                            isAuth.isAuthenticated
                                ? isRecruiter
                                    ? '/postedjobs'
                                    : '/dashboard'
                                : '/login'
                        }
                    >
                        <span>Explore Opportunities</span>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>

                    <Link
                        className={styles['secondary-cta']}
                        href={isAuth.isAuthenticated ? '/postjob' : '/signup'}
                    >
                        <span>Post a Job</span>
                    </Link>
                </div>

                <div className={styles['stats-strip']}>
                    <div className={styles['stat-item']}>
                        <span className={styles['stat-number']}>1,400+</span>
                        <span className={styles['stat-label']}>Verified Roles</span>
                    </div>
                    <div className={styles['stat-divider']} />
                    <div className={styles['stat-item']}>
                        <span className={styles['stat-number']}>100%</span>
                        <span className={styles['stat-label']}>Salary Transparency</span>
                    </div>
                    <div className={styles['stat-divider']} />
                    <div className={styles['stat-item']}>
                        <span className={styles['stat-number']}>Direct</span>
                        <span className={styles['stat-label']}>Recruiter Connection</span>
                    </div>
                </div>
            </div>

            <div className={styles['hero-visual']}>
                <Hero3D />
            </div>
        </section>
    );
};

export default GreetingsSection;
