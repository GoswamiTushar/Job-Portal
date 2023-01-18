import React, { FC, useContext, useRef, useEffect, useState } from 'react'
import { authContext } from '../../pages/_app'
import NavbarButton from '../NavbarButton'
import { useRouter } from 'next/router'
import Toast from '../Toast'
import Loader from '../Loader'
import { navIcons } from './_icons'
import styles from './Navbarstyle.module.scss'
import Link from 'next/link'

const Index: FC = () => {
    const router = useRouter()
    const [logoutTileOpen, setLogoutTileOpen] = useState(false)
    const [isLogoutToastOpen, setLogoutToastOpen] = useState(false)
    const [isAuth, setIsAuth] = useState(false)
    const [isLoading, setLoader] = useState(false)
    const userContext = useContext(authContext)

    const wrapperRef = useRef(null);

    function useOutsideAlerter(ref: any) {
        useEffect(() => {
            /**
             * Alert if clicked on outside of element
             */
            function handleClickOutside(event: any) {
                if (ref.current && !ref.current.contains(event.target)) {
                    setLogoutTileOpen(false)
                }
            }
            // Bind the event listener
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                // Unbind the event listener on clean up
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }
    useOutsideAlerter(wrapperRef);


    useEffect(() => {
        userContext.isAuthenticated === true ? setIsAuth(true) : void 0
        // console.log("in navbar from context useeffect-------->", userContext.isAuthenticated)
    }, [userContext])

    const handleLogout = () => {
        setLoader(true)
        localStorage.removeItem('squareboatJobPortalToken');
        localStorage.removeItem('sb-userRole')
        localStorage.clear()
        setLogoutTileOpen(false)
        setLogoutToastOpen(true)
        userContext.setLogout()
        router.push("/");
        setIsAuth(false)
        setTimeout(() => setLogoutToastOpen(false), 2000)
        setLoader(false)
    }
    const tileControl = () => {
        setLogoutTileOpen(!logoutTileOpen)
    }
    return (
        <section className={styles['navbar-container']}>
            <nav className={styles["navbar"]}>
                <Link href="/">
                    <div className={styles["page-title"]}>
                        <span className={styles['colored-light']}>
                            My
                        </span>
                        <span className={styles['colored']}>
                            Jobs
                        </span>
                    </div>
                </Link>
                {
                    // router.pathname === '/' && (typeof window !== 'undefined' && localStorage.getItem("squareboatJobPortalToken") === 'undefined')
                    !isAuth || router.pathname === '/forgot-password' || router.pathname === '/reset-password'
                        ?
                        <div className={styles["btn-contianer"]}>
                            <NavbarButton toShow={true} />
                        </div>
                        :
                        <></>

                }
                {
                    // router.pathname === '/dashboard'
                    //     ||
                    //     router.pathname === '/postedjobs'
                    //     ||
                    //     router.pathname === '/appliedjobs'
                    //     ||
                    //     router.pathname === '/postjob'
                    //     ||
                    //     router.pathname === '/'
                    isAuth
                        ?
                        <>
                            <div className={styles["container"]}>
                                <span
                                    className={styles['post-job-link']}
                                >
                                    <Link href={
                                        `${typeof window !== 'undefined'
                                            &&
                                            localStorage.getItem("sb-userRole")
                                            }` === "0"
                                            ?
                                            "/postjob"
                                            :
                                            "/appliedjobs"
                                    }>
                                        <a
                                            suppressHydrationWarning
                                            style={
                                                router.pathname === '/appliedjobs'
                                                    ||
                                                    router.pathname === '/postjob' ?
                                                    {
                                                        textDecoration: "none",
                                                        paddingBottom: "1.15rem",
                                                        borderBottom: "2px solid #43AFFF",
                                                        color: "inherit"
                                                    }
                                                    :
                                                    {
                                                        textDecoration: "none",
                                                        color: "inherit"
                                                    }
                                            }>
                                            {
                                                `${typeof window !== 'undefined'
                                                    &&
                                                    localStorage.getItem("sb-userRole")
                                                    }` === "0"
                                                    ?
                                                    "Post a Job"
                                                    :
                                                    "Applied Jobs"

                                            }
                                        </a>
                                    </Link>
                                </span>
                                <Link href={(typeof window !== 'undefined' && localStorage.getItem("sb-userRole") === "0") ? "/postedjobs" : "/dashboard"}>
                                    <span className={styles['profile-bubble']}>
                                        {
                                            (typeof window !== 'undefined' && localStorage.getItem("sb-userRole") === "0") ? "R" : "C"
                                        }
                                    </span>
                                </Link>
                                <span
                                    className={styles['expand-btn']}
                                    onClick={tileControl}
                                >
                                    <img src={navIcons.Down} alt={"Down arrow"} className={styles['icon']} />
                                </span>
                            </div>
                            {
                                logoutTileOpen ?
                                    (
                                        <div
                                            ref={wrapperRef}
                                            onClick={handleLogout}
                                            className={styles["logout-tile"]}>
                                            <div className={styles["out-arrow"]}>
                                                Logout
                                            </div>
                                        </div>
                                    )
                                    :
                                    (void 0)
                            }
                        </> :
                        ""
                }
            </nav>
            {
                typeof window !== 'undefined' && router.pathname === "/"
                    ?
                    <Toast
                        heading="Logout"
                        message="You have successfully logged out."
                        isToastOpen={isLogoutToastOpen}
                        setToastOpen={setLogoutToastOpen}
                    />
                    :
                    null
            }
            <Loader isLoading={isLoading} />
        </section>
    )
}

export default Index

