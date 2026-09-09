import React, { FC, useContext, useRef, useEffect, useState } from 'react';
import { authContext } from '../../pages/_app';
import NavbarButton from '../NavbarButton';
import ThemeToggle from '../ThemeToggle';
import { useRouter } from 'next/router';
import Toast from '../Toast';
import Loader from '../Loader';
import styles from './Navbarstyle.module.scss';
import Link from 'next/link';
import { logoutUser } from '../../utils/apis';

const Navbar: FC = () => {
    const router = useRouter();
    const [logoutTileOpen, setLogoutTileOpen] = useState(false);
    const [isLogoutToastOpen, setLogoutToastOpen] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setLoader] = useState(false);
    const userContext = useContext(authContext);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setLogoutTileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (userContext.isAuthenticated) {
            setIsAuth(true);
        } else {
            setIsAuth(false);
        }
    }, [userContext.isAuthenticated]);

    const handleLogout = async () => {
        setLoader(true);
        try {
            await logoutUser();
        } catch (e) {
            // Proceed with client cleanup
        }
        localStorage.removeItem('squareboatJobPortalToken');
        localStorage.removeItem('sb-userRole');
        localStorage.clear();
        setLogoutTileOpen(false);
        setLogoutToastOpen(true);
        userContext.setLogout();
        setIsAuth(false);
        router.push('/');
        setTimeout(() => setLogoutToastOpen(false), 2500);
        setLoader(false);
    };

    const isRecruiter = typeof window !== 'undefined' && localStorage.getItem('sb-userRole') === '0';

    return (
        <header className={styles['navbar-container']}>
            <nav className={styles['navbar']}>
                <Link href="/" className={styles['brand-link']}>
                    <div className={styles['brand-logo']}>
                        <div className={styles['logo-mark']}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/rolecrest-logo.png" alt="RoleCrest" className={styles['logo-img']} />
                        </div>
                        <div className={styles['page-title']}>
                            <span className={styles['brand-prefix']}>Role</span>
                            <span className={styles['brand-suffix']}>Crest</span>
                        </div>
                    </div>
                </Link>

                <div className={styles['actions-wrapper']}>
                    <ThemeToggle />

                    {!isAuth ? (
                        <NavbarButton toShow={true} />
                    ) : (
                        <div className={styles['auth-menu']}>
                            <Link
                                href={isRecruiter ? '/postjob' : '/appliedjobs'}
                                className={`${styles['nav-item']} ${
                                    router.pathname === '/postjob' || router.pathname === '/appliedjobs'
                                        ? styles['active']
                                        : ''
                                }`}
                            >
                                {isRecruiter ? '+ Post a Job' : 'My Applications'}
                            </Link>

                            <Link
                                href={isRecruiter ? '/postedjobs' : '/dashboard'}
                                className={`${styles['nav-item']} ${
                                    router.pathname === '/postedjobs' || router.pathname === '/dashboard'
                                        ? styles['active']
                                        : ''
                                }`}
                            >
                                {isRecruiter ? 'Posted Jobs' : 'Browse Jobs'}
                            </Link>

                            {!isRecruiter && (
                                <Link
                                    href="/profile"
                                    className={`${styles['nav-item']} ${
                                        router.pathname === '/profile' ? styles['active'] : ''
                                    }`}
                                >
                                    My Profile
                                </Link>
                            )}

                            <div className={styles['profile-dropdown-wrapper']} ref={wrapperRef}>
                                <button
                                    type="button"
                                    className={styles['profile-bubble-btn']}
                                    onClick={() => setLogoutTileOpen(!logoutTileOpen)}
                                    aria-label="User menu"
                                >
                                    <span className={styles['avatar-initial']}>
                                        {isRecruiter ? 'R' : 'C'}
                                    </span>
                                    <svg
                                        className={`${styles['chevron']} ${logoutTileOpen ? styles['open'] : ''}`}
                                        viewBox="0 0 24 24"
                                        width="14"
                                        height="14"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {logoutTileOpen && (
                                    <div className={styles['logout-dropdown']}>
                                        <div className={styles['dropdown-user-info']}>
                                            <span className={styles['role-badge']}>
                                                {isRecruiter ? 'Recruiter Account' : 'Candidate Account'}
                                            </span>
                                        </div>
                                        <div className={styles['dropdown-divider']} />
                                        
                                        {!isRecruiter ? (
                                            <>
                                                <Link
                                                    href="/profile"
                                                    className={styles['dropdown-item-link']}
                                                    onClick={() => setLogoutTileOpen(false)}
                                                >
                                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                        <circle cx="12" cy="7" r="4" />
                                                    </svg>
                                                    <span>My Profile</span>
                                                </Link>
                                                <Link
                                                    href="/appliedjobs"
                                                    className={styles['dropdown-item-link']}
                                                    onClick={() => setLogoutTileOpen(false)}
                                                >
                                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                                    </svg>
                                                    <span>My Applications</span>
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/postedjobs"
                                                    className={styles['dropdown-item-link']}
                                                    onClick={() => setLogoutTileOpen(false)}
                                                >
                                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="8" y1="6" x2="21" y2="6" />
                                                        <line x1="8" y1="12" x2="21" y2="12" />
                                                        <line x1="8" y1="18" x2="21" y2="18" />
                                                        <line x1="3" y1="6" x2="3.01" y2="6" />
                                                        <line x1="3" y1="12" x2="3.01" y2="12" />
                                                        <line x1="3" y1="18" x2="3.01" y2="18" />
                                                    </svg>
                                                    <span>Manage Jobs</span>
                                                </Link>
                                                <Link
                                                    href="/postjob"
                                                    className={styles['dropdown-item-link']}
                                                    onClick={() => setLogoutTileOpen(false)}
                                                >
                                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                    <span>+ Post a Job</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className={styles['dropdown-divider']} />
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className={styles['dropdown-logout-btn']}
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                width="16"
                                                height="16"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {typeof window !== 'undefined' && router.pathname === '/' && (
                <Toast
                    heading="Signed Out"
                    message="You have been safely signed out."
                    isToastOpen={isLogoutToastOpen}
                    setToastOpen={setLogoutToastOpen}
                />
            )}
            <Loader isLoading={isLoading} />
        </header>
    );
};

export default Navbar;
