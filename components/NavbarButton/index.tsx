import { FC } from 'react'
import Link from 'next/link'
import styles from './NavButtonstyle.module.scss'
import { useRouter } from 'next/router'

interface NavBtnProps {
    toShow: boolean,
}

const index: FC<NavBtnProps> = ({ toShow }) => {
    const router = useRouter()
    const currentRoute = router.pathname
    return (
        <button className={styles['navbar-btn']} style={toShow ? { display: 'block' } : { display: 'none' }}>
            <span className={styles["nav-link"]}>
                <Link href="/login">
                    <a className={currentRoute === "/login" ? styles["active"] : ''}>Login</a>
                </Link>
            </span>
            /
            <span className={styles["nav-link"]}>
                <Link href="/signup">
                    <a className={currentRoute === "/signup" ? styles["active"] : ''}>Signup</a>
                </Link>
            </span>
        </button>
    )
}

export default index