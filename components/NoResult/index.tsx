import { useRouter } from 'next/router';
import Link from 'next/link';
import { FC } from 'react'
import GenericButton from '../../components/GenericButton'
import styles from './styles.module.scss';

const index: FC = () => {
    const router = useRouter()
    return (
        <div className={styles['no-result']}>
            <div className={styles["content"]}>
                {
                    router.pathname === '/appliedjobs' ?
                        <>
                            <img src="" alt="icon" className="icon" />
                            <p className={styles['data']}>
                                Your applied jobs will show here
                            </p>
                            <Link
                                style={{ textDecoration: "none", color: "none" }} href="/dashboard">
                                <GenericButton text="See all job" />
                            </Link>
                        </>
                        :
                        router.pathname === '/postedjobs' ?
                            <>
                                <img src="" alt="icon" className="icon" />
                                <p className={styles['data']}>
                                    Your posted jobs will show here
                                </p>
                                <Link
                                    style={{ textDecoration: "none", color: "none" }} href="/">
                                    <GenericButton text="Post a job" />
                                </Link>
                            </>
                            :
                            void 0
                }
            </div>
        </div>
    )
}

export default index