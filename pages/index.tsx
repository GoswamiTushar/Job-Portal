import type { NextPage } from 'next'
import GreetingsSection from '../components/LandingPage/GreetingsSection'
import WhyUsSection from '../components/LandingPage/WhyUsSection'
import ClientelSection from '../components/LandingPage/ClientelSection'
import MyJobMetaData from '../components/MyJobMetaData'
import styles from './indexstyle.module.scss'

const Home: NextPage = () => {
    return (
        <section className={`w_container ${styles['landing-page']}`}>
            <MyJobMetaData
                title='MyJob Job Portal Squareboat'
                description='Welcome to MyJob Job Poral created as a dummy project by new joinees at the Squareboat organization'
            />
            <GreetingsSection />
            <WhyUsSection />
            <ClientelSection />
        </section>
    )
}

export default Home