import { FC, ReactComponentElement, ReactElement, ReactNode, useRef, useEffect } from 'react'
import styles from './styles.module.scss'


const index = ({
    children,
    isModalOpen,
    setIsModalOpen,
}
    :
    {
        children: any,
        isModalOpen: boolean,
        setIsModalOpen?: any,
    }) => {

    useEffect(() => {
        // window.scrollTo(0, 0)
        isModalOpen ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto'

    }, [isModalOpen])
    return (
        <div
            className={styles['modal-container']}
            style={isModalOpen ? { display: "block" } : { display: "none" }}
        >
            <div
                className={styles["modal"]}>
                {children}
            </div>
        </div>
    )
}

export default index