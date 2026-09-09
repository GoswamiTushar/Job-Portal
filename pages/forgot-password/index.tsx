import { FC } from 'react'
import ForgotPasswordCard from '../../components/Cards/ForgotPasswordCard'
import MyJobMetaData from '../../components/MyJobMetaData'
import styles from './styles.module.scss'


const index = () => {
    return (
        <section className={styles['forgot-password']}>
            <MyJobMetaData
                title='Forgot Password | RoleCrest'
                description='Reset your RoleCrest account password securely.'
            />
            <ForgotPasswordCard />

        </section>
    )
}

export default index