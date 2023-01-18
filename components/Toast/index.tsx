import { FC, SetStateAction, useState } from 'react'
import styles from './styles.module.scss'


interface Toast {
    heading: string,
    message: string | null,
    isToastOpen: boolean,
    setToastOpen?: any,
}

const index: FC<Toast> = ({
    heading,
    message = null,
    isToastOpen = true,
    setToastOpen,
}) => {

    if (isToastOpen) {
        return (
            <div className={styles['toast-container']}>
                <div className={styles["toast"]}>
                    <div className={styles["close-btn-container"]}>
                        <img
                            src='/icons/modal/close.png'
                            alt="close"
                            className={styles['btn']}
                            onClick={() => {
                                setToastOpen(false)
                            }}
                        />
                    </div>
                    <div className={styles["title"]}>
                        {heading}
                    </div>
                    <div className={styles["message"]}>
                        {message}
                    </div>
                </div>
            </div>
        )
    }
    return (
        <></>
    )
}

export default index