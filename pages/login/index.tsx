import { FC } from 'react'
import LoginCard from '../../components/Cards/LoginCard'
import MyJobMetaData from '../../components/MyJobMetaData'
import styles from './styles.module.scss'

const index: FC = () => {
    return (
        <section className={styles['login-section']}>
            <MyJobMetaData
                title='MyJob login'
                description='JobPortal Login section for recruiters and candidates for looking for job and candidates'
            />
            <LoginCard />
        </section>
    )
}

export default index
