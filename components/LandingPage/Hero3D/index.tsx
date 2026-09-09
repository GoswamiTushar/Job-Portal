import React, { FC, useRef, useState, useEffect } from 'react';
import styles from './styles.module.scss';

const Hero3D: FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Maximum tilt angle in degrees
            const maxTilt = 12;
            const rotX = -((y - centerY) / centerY) * maxTilt;
            const rotY = ((x - centerX) / centerX) * maxTilt;

            setRotation({ x: rotX, y: rotY });
        };

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => {
            setIsHovered(false);
            setRotation({ x: 0, y: 0 });
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div ref={containerRef} className={styles['hero-3d-wrapper']}>
            <div
                className={`${styles['scene']} ${!isHovered ? styles['floating-idle'] : ''}`}
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                }}
            >
                {/* 3D Backdrop Glow Mesh */}
                <div className={styles['backdrop-glow']} />

                {/* Floating Top Badge */}
                <div className={`${styles['floating-chip']} ${styles['chip-top-right']}`}>
                    <div className={styles['chip-icon-verified']}>
                        <span className={styles['pulse-dot']} />
                    </div>
                    <div className={styles['chip-content']}>
                        <span className={styles['chip-title']}>Direct Recruiter Sync</span>
                        <span className={styles['chip-sub']}>Verified Employer Pipeline</span>
                    </div>
                </div>

                {/* Main 3D Glassmorphic Job Card */}
                <div className={styles['main-card']}>
                    <div className={styles['card-header']}>
                        <div className={styles['company-avatar']}>
                            <span>⚡</span>
                        </div>
                        <div className={styles['job-meta']}>
                            <h3 className={styles['job-title']}>Lead Full-Stack Architect</h3>
                            <div className={styles['company-row']}>
                                <span className={styles['company-name']}>Vanguard AI</span>
                                <span className={styles['verified-badge']}>✓ VERIFIED</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles['card-body']}>
                        <p className={styles['job-summary']}>
                            Architect scalable AI platforms and high-throughput microservices using Next.js, Node, and modern cloud infrastructure.
                        </p>

                        <div className={styles['tag-row']}>
                            <span className={styles['tag']}>$185,000 - $240,000</span>
                            <span className={styles['tag']}>Remote</span>
                            <span className={styles['tag']}>Full-time</span>
                        </div>

                        <div className={styles['skill-pills']}>
                            <span className={styles['skill-pill']}>Next.js</span>
                            <span className={styles['skill-pill']}>TypeScript</span>
                            <span className={styles['skill-pill']}>MongoDB</span>
                            <span className={styles['skill-pill']}>AWS</span>
                        </div>
                    </div>

                    <div className={styles['card-footer']}>
                        <div className={styles['applicant-count']}>
                            <span className={styles['avatars']}>👥</span>
                            <span>14 Candidates applied</span>
                        </div>
                        <div className={styles['demo-apply-btn']}>
                            <span>1-Click Apply</span>
                        </div>
                    </div>
                </div>

                {/* Floating Bottom Left Badge */}
                <div className={`${styles['floating-chip']} ${styles['chip-bottom-left']}`}>
                    <div className={styles['linkedin-badge-icon']}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#0A66C2">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                    </div>
                    <div className={styles['chip-content']}>
                        <span className={styles['chip-title']}>1-Click LinkedIn Sync</span>
                        <span className={styles['chip-sub']}>Verified Candidate Profile</span>
                    </div>
                </div>

                {/* Floating Metric Badge */}
                <div className={`${styles['floating-chip']} ${styles['chip-bottom-right']}`}>
                    <span className={styles['bolt-icon']}>📊</span>
                    <div className={styles['chip-content']}>
                        <span className={styles['chip-title']}>Live Status Tracking</span>
                        <span className={styles['chip-sub']}>Real-Time Pipeline Updates</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero3D;
