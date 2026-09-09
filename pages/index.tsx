import type { NextPage } from 'next';
import GreetingsSection from '../components/LandingPage/GreetingsSection';
import WhyUsSection from '../components/LandingPage/WhyUsSection';
import ClientelSection from '../components/LandingPage/ClientelSection';
import MyJobMetaData from '../components/MyJobMetaData';
import styles from './indexstyle.module.scss';

const Home: NextPage = () => {
    return (
        <section className={`w_container ${styles['landing-page']}`}>
            <MyJobMetaData
                title='RoleCrest — Next-Gen Career & Talent Platform'
                description='Discover verified engineering and tech opportunities with guaranteed active recruiters, transparent compensation, and 1-click verification.'
            />
            <GreetingsSection />
            <WhyUsSection />
            <ClientelSection />
        </section>
    );
};

export default Home;