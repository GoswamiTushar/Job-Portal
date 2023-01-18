import { FC } from 'react'
import ResetPasswordCard from '../../components/Cards/ResetPasswordCard'
import MyJobMetaData from '../../components/MyJobMetaData'
import styles from './styles.module.scss'

const index: FC = () => {
    return (
        <section className={styles['reset-password']}>
            <MyJobMetaData
                title='Reset Password MyJobs Job Portal Squareboat'
                description='Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quisquam quas dolore, blanditiis accusamus est et harum quasi quibusdam asperiores totam.'
            />
            <ResetPasswordCard />
        </section>
    )
}

export default index