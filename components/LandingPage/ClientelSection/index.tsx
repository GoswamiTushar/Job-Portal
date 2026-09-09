import { FC } from 'react';
import { companyLogos } from './logos';
import styles from './styles.module.scss';

type ImageObj = {
    company: string;
    image: string;
};

// Quadruple the logos array so the track seamlessly scrolls infinitely across all screen widths
const marqueeLogos = [...companyLogos, ...companyLogos, ...companyLogos, ...companyLogos];

const ClientelSection: FC = () => {
    return (
        <section className={styles['clients']}>
            <div className={styles['heading']}>
                <span className={styles['tag']}>INDUSTRY ECOSYSTEM</span>
                <h2>Trusted by teams building the future</h2>
            </div>
            <div className={styles['marquee-wrapper']}>
                <div className={styles['marquee-track']}>
                    {marqueeLogos.map((obj: ImageObj, index: number) => (
                        <div key={`${obj.company}-${index}`} className={styles['logo-card']}>
                            <img src={obj.image} alt={obj.company} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ClientelSection;
