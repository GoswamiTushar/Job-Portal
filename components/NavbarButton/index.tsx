import { FC } from 'react';
import Link from 'next/link';
import styles from './NavButtonstyle.module.scss';
import { useRouter } from 'next/router';

interface NavBtnProps {
    toShow: boolean;
}

const NavbarButton: FC<NavBtnProps> = ({ toShow }) => {
    const router = useRouter();
    const currentRoute = router.pathname;

    if (!toShow) return null;

    return (
        <div className={styles['auth-buttons-group']}>
            <Link
                href="/login"
                className={`${styles['btn']} ${styles['login-btn']} ${currentRoute === '/login' ? styles['active'] : ''}`}
            >
                Log In
            </Link>
            <Link
                href="/signup"
                className={`${styles['btn']} ${styles['signup-btn']} ${currentRoute === '/signup' ? styles['active'] : ''}`}
            >
                Sign Up
            </Link>
        </div>
    );
};

export default NavbarButton;