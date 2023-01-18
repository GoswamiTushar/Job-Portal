import { FC } from 'react'
import styles from './styles.module.scss'

interface CardContent {
    title: string,
    desc: string,
}

const index: FC<CardContent> = ({ title, desc }) => {
    return (
        <div className={styles['white-card']}>
            <div className={styles["title"]}>
                {title}
            </div>
            <div className={styles["desc"]}>
                {desc}
            </div>
        </div>
    )
}

export default index
