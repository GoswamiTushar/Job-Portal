import { FC } from 'react';
import WhyUsCard from '../../Cards/WhyUsCard';
import { cardsContent } from './_info';
import styles from './styles.module.scss';

type CardContent = {
    heading: string;
    description: string;
    icon?: string;
};

const WhyUsSection: FC = () => {
    return (
        <section className={styles['why-us']}>
            <div className={styles['section-header']}>
                <span className={styles['section-tag']}>PLATFORM ADVANTAGES</span>
                <h2 className={styles['section-title']}>
                    Built for candidates & recruiters who value transparency.
                </h2>
                <p className={styles['section-subtitle']}>
                    Every feature is engineered to eliminate noise, guesswork, and friction from hiring.
                </p>
            </div>

            <div className={styles['cards-grid']}>
                {cardsContent.map((obj: CardContent, index: number) => (
                    <WhyUsCard
                        key={index.toString()}
                        title={obj.heading}
                        desc={obj.description}
                        icon={obj.icon}
                    />
                ))}
            </div>
        </section>
    );
};

export default WhyUsSection;
