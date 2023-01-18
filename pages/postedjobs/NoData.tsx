import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC } from 'react'
import styles from './styles.module.scss'

export const icons = {
    closeIcon: '/icons/modal/close.png',
    noData: '/icons/NoData/resume.png'
}

export const NoDataModal: FC = () => {
    const router = useRouter()
    return (
        <div className={styles['no-data-modal']}>
            <div className={styles["wrapper"]}>
                <img className={styles['icon']} src={icons.noData} alt="No Data" />
                <p className={styles["data-status"]}>
                    No Applications available!
                </p>
            </div>
        </div>
    )
}

const NoData: FC = () => {
    const router = useRouter()

    return (
        <div className={styles['no-data']}>
            <div className={styles["wrapper"]}>
                <img className={styles['icon']} src={icons.noData} alt="No Data" />
                <p className={styles["data-status"]}>
                    Your posted jobs will show here!
                </p>
                {
                    router.pathname === '/postedjobs' ?
                        <Link href="/postjob">
                            <a className={styles['get-started-btn']}>
                                Post Job
                            </a>
                        </Link>
                        :
                        void 0
                }
            </div>
        </div>
    )
}

export default NoData 