import { FC } from 'react'
import ForgotPasswordCard from '../../components/Cards/ForgotPasswordCard'
import MyJobMetaData from '../../components/MyJobMetaData'
import styles from './styles.module.scss'


const index = () => {
    return (
        <section className={styles['forgot-password']}>
            <MyJobMetaData
                title='Forgot Password MyJobs'
                description='Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet assumenda aliquid veritatis, eligendi nostrum est nisi beatae deleniti earum exercitationem.'
            />
            <ForgotPasswordCard />

        </section>
    )
}

export default index