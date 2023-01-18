import { FC, useContext } from 'react'
import Link from 'next/link'
import { authContext } from '../../../pages/_app'
import { images } from '../_images'
import styles from './styles.module.scss'

const index: FC = () => {
    const isAuth = useContext(authContext)
    return (
        <div className={styles["greetings-section"]}>
            <div className={styles["desc-container"]}>
                <header>
                    <h1 className={styles['title']}>
                        Welcome to
                        <br />
                        <span className={styles['logo']}>
                            <span className={styles['.colored-light']}>
                                My
                            </span>
                            <span className={styles['colored']}>
                                Jobs
                            </span>
                        </span>
                    </h1>
                </header>

                <div className={styles["btn-container"]}>
                    <Link
                        href={
                            isAuth.isAuthenticated
                                ?
                                typeof window !== 'undefined' && localStorage.getItem('sb-userRole') == "0"
                                    ?
                                    "/postedjobs" : "/dashboard"
                                :
                                "/login"
                        }
                    >
                        <a className={styles['get-started-btn']}>
                            Get Started
                        </a>
                    </Link>
                </div>
            </div>

            <div className={styles["image-container"]}>
                <img className={styles['img']} src={images.landingPageImage} alt="smiling face" />
            </div>
        </div>
    )
}

export default index
