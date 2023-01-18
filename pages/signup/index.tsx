import { FC } from 'react'
import SignupCard from '../../components/Cards/SignupCard'
import MyJobMetaData from '../../components/MyJobMetaData'
import styles from './styles.module.scss'

const index: FC = () => {
    return (
        <section className={styles['signup-page']}>
            <MyJobMetaData
                title='Signup My Job Job Portal- Squareboat'
                description='Signup as a candidate or as an recruiter for finfing jobs or candidates. One stop solution for your Job or Organization needs'
            />
            <SignupCard />
        </section>
    )
}

export default index