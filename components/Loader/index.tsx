import { FC } from 'react'
import styles from './styles.module.scss'

interface Loading {
    isLoading: boolean,
}

const index: FC<Loading> = ({ isLoading }) => {
    return isLoading ? (
        <div className={styles['loader']}>
            <object className={styles['icon']} type="image/svg+xml" data="/SVG/loader.svg" />
        </div>
    ) : <></>
}

export default index