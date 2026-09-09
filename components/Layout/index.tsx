import React, { FC, ReactNode } from 'react';
import Navbar from '../Navbar';
import Ambient3DBackground from '../Ambient3DBackground';
import styles from './LayoutStyle.module.scss';

type Props = {
    children?: ReactNode;
    size?: string;
};

const Layout: FC<Props> = ({ children }) => {
    return (
        <div className={styles['layout-container']}>
            <Ambient3DBackground />
            <Navbar />
            <main className={styles['main-content']}>
                {children}
            </main>
        </div>
    );
};

export default Layout;