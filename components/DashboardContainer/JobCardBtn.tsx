import { FC } from 'react'
import styles from './styles.module.scss'

interface JobCard {
    text: string,
    setModalOpen?: any,
    setClickedJobID?: any,
    jobID?: any,
    applyClicked?: any
}

const JobCardBtn: FC<JobCard> = ({ text, setModalOpen, setClickedJobID, jobID, applyClicked }) => {
    return (
        <button
            className={styles['job-card-btn']}
            onClick={() => {
                setClickedJobID(jobID)
                applyClicked.current = true
                if (setModalOpen) {
                    setModalOpen(true)
                }
            }
            }
        >
            <div className={styles["text"]}>
                {text}
            </div>
        </button>
    )
}

export default JobCardBtn