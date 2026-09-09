import React, { FC } from 'react';
import styles from './styles.module.scss';

const Ambient3DBackground: FC = () => {
    return (
        <div className={styles['ambient-container']} aria-hidden="true">
            {/* Subtle tech grid mesh */}
            <div className={styles['grid-pattern']} />

            {/* 3D Floating Glowing Orbs */}
            <div className={`${styles['orb']} ${styles['orb-1']}`} />
            <div className={`${styles['orb']} ${styles['orb-2']}`} />
            <div className={`${styles['orb']} ${styles['orb-3']}`} />

            {/* Top ambient illumination sheen */}
            <div className={styles['top-sheen']} />
        </div>
    );
};

export default Ambient3DBackground;
