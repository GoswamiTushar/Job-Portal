import React, { FC } from 'react';
import { use3DTilt } from '../../../hooks/use3DTilt';
import styles from './styles.module.scss';

interface CardContent {
    title: string;
    desc: string;
    icon?: string;
}

const WhyUsCard: FC<CardContent> = ({ title, desc, icon = '✨' }) => {
    const tiltRef = use3DTilt<HTMLDivElement>({ maxTilt: 7, scale: 1.02 });

    return (
        <div ref={tiltRef} className={styles['feature-card']}>
            <div className={styles['icon-box']}>
                <span>{icon}</span>
            </div>
            <h3 className={styles['title']}>{title}</h3>
            <p className={styles['desc']}>{desc}</p>
        </div>
    );
};

export default WhyUsCard;
