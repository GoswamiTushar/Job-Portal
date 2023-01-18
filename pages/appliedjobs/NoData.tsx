import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import styles from './styles.module.scss'

const NoData: FC = ({ isLoading }: any) => {
    const [isRecruiter, setIsRecruiter] = useState(false)

    useEffect(() => {
        if (`${typeof window !== 'undefined' && localStorage.getItem("sb-userRole")}` === "0") {
            setIsRecruiter(true)
        }
    }, [])

    const router = useRouter()

    return (

        <div className={styles['no-data']}>
            <div className={styles["wrapper"]}>
                <img className={styles['icon']} src={`/icons/NoData/${isRecruiter ? "writing.png" : "resume.png"}`} alt="No Data" />
                <p className={styles["data-status"]}>
                    {
                        router.pathname === '/appliedjobs' ? "Your applied jobs will show here" : ""
                    }
                </p>
                <Link href="/dashboard">
                    <a className={styles['get-started-btn']}>
                        See all jobs
                    </a>
                </Link>
            </div>
        </div>
    )
}

export default NoData