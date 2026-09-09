import { FC } from 'react';
import JobCardBtn from './JobCardBtn';
import styles from './styles.module.scss';
import { useRouter } from 'next/router';
import { use3DTilt } from '../../hooks/use3DTilt';

interface JobCardProps {
    jobTitle: string;
    jobDesc: string;
    jobLocation: string;
    handleOpen?: any;
    jobID: any;
    setClickedJobID?: any;
    allApplications?: any;
    setAllApplications?: any;
    setModalOpen?: any;
    applyClicked?: any;
}

const DashboardItem: FC<JobCardProps> = ({
    jobTitle,
    jobDesc,
    jobLocation,
    setClickedJobID,
    setModalOpen,
    jobID,
    applyClicked,
}) => {
    const router = useRouter();
    const isAppliedPage = router.pathname === '/appliedjobs';
    const isRecruiter = typeof window !== 'undefined' && localStorage.getItem('sb-userRole') === '0';

    const tiltRef = use3DTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 });

    // Extract first letter or default
    const initialLetter = jobTitle ? jobTitle.trim().charAt(0).toUpperCase() : 'J';

    return (
        <div ref={tiltRef} className={styles['dashboard-item']}>
            <div className={styles['card-header']}>
                <div className={styles['avatar-box']}>
                    <span>{initialLetter}</span>
                </div>
                <div className={styles['title-group']}>
                    <h3 className={styles['post-title']} title={jobTitle}>
                        {jobTitle}
                    </h3>
                    <div className={styles['badge-row']}>
                        <span className={styles['verified-chip']}>✓ Verified Role</span>
                        <span className={styles['job-type-chip']}>Full-time</span>
                    </div>
                </div>
            </div>

            <p className={styles['post-desc']} title={jobDesc}>
                {jobDesc}
            </p>

            <div className={styles['card-footer']}>
                <div className={styles['location-chip']}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className={styles['location-text']}>{jobLocation}</span>
                </div>

                <div className={styles['action-wrapper']}>
                    {isAppliedPage ? (
                        <span className={styles['applied-badge']}>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Applied</span>
                        </span>
                    ) : (
                        <JobCardBtn
                            text={isRecruiter ? 'View Applicants' : 'Apply Now'}
                            setModalOpen={setModalOpen}
                            setClickedJobID={setClickedJobID}
                            jobID={jobID}
                            applyClicked={applyClicked}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardItem;