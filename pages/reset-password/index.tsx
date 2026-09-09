import { FC } from 'react'
import ResetPasswordCard from '../../components/Cards/ResetPasswordCard'
import MyJobMetaData from '../../components/MyJobMetaData'
import styles from './styles.module.scss'

const index: FC = () => {
    return (
        <section className={styles['reset-password']}>
            <MyJobMetaData
                title='Reset Password | RoleCrest'
                description='Create a new secure password for your RoleCrest account.'
            />
            <ResetPasswordCard />
        </section>
    )
}

export default index