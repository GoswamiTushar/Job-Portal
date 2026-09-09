import { FC } from 'react';
import styles from './styles.module.scss';

interface JobCardBtnProps {
    text: string;
    setModalOpen?: (open: boolean) => void;
    setClickedJobID?: (id: any) => void;
    jobID?: any;
    applyClicked?: { current: boolean };
}

const JobCardBtn: FC<JobCardBtnProps> = ({ text, setModalOpen, setClickedJobID, jobID, applyClicked }) => {
    const isApply = text.toLowerCase().includes('apply');

    return (
        <button
            type="button"
            className={`${styles['job-card-btn']} ${isApply ? styles['apply-btn'] : styles['view-btn']}`}
            onClick={() => {
                if (setClickedJobID) setClickedJobID(jobID);
                if (applyClicked) applyClicked.current = true;
                if (setModalOpen) setModalOpen(true);
            }}
        >
            <span className={styles['btn-text']}>{text}</span>
            {isApply && (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                </svg>
            )}
        </button>
    );
};

export default JobCardBtn;