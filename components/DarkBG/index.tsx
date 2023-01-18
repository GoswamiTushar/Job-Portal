import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './DarkBGStyle.module.scss'

function index() {
    const location = useRouter()
    return (
        <>
            {location.pathname === "/"
                ?
                <div className={styles['bg-formatted-landingpage']} />
                :
                location.pathname === "/login" || location.pathname === '/signup' || location.pathname === '/forgot-password' || location.pathname === '/reset-password' || location.pathname === '/postjob'
                    ?
                    <div className={styles['bg-formatted-auth']} />
                    :
                    location.pathname === "/dashboard" || location.pathname === '/postedjobs' || location.pathname === '/appliedjobs' ?
                        <div className={styles['bg-formatted-dashboard']} />
                        :
                        location.pathname === "/post-a-job" ?
                            <div className={styles['bg-formatted-post-job']} />
                            :
                            ""
            }
        </>
    )
}

export default index