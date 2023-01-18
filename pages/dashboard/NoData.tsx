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
                        router.pathname === '/dashboard' ? "No Jobs available" : "No Jobs posted by you"
                    }
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