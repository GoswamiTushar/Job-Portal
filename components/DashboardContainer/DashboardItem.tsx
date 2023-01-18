import { FC } from 'react'
import { icons } from './_static'
import JobCardBtn from './JobCardBtn'
import styles from './styles.module.scss'
import { useRouter } from 'next/router'

interface JobCard {
    jobTitle: string,
    jobDesc: string,
    jobLocation: string,
    handleOpen?: any,
    jobID: any,
    setClickedJobID: string,
    allApplications: any,
    setAllApplications: any,
    setModalOpen?: any,
    applyClicked?: any
}

const DashboardItem = ({
    jobTitle,
    jobDesc,
    jobLocation,
    setClickedJobID,
    setModalOpen,
    jobID,
    applyClicked
}: JobCard) => {
    const router = useRouter()
    return (
        <div className={styles["dashboard-item"]}>
            <div className={styles["post-title"]}>
                {jobTitle}
            </div>
            <div className={styles["post-desc"]}>
                <div className={styles["desc"]}>
                    {jobDesc}
                </div>
                <span className={styles["post-desc-tooltip"]}>
                    {jobDesc}
                </span>
            </div>
            <div className={styles["additional-info"]}>
                <div className={styles["location"]}>
                    <img src={icons.locationIcon} alt="location icon" className={styles['icon']} />
                    <p className={styles['location-name']}>
                        {jobLocation}
                    </p>
                    <span className={styles['location-tooltip']}>
                        {jobLocation}
                    </span>
                </div>
                <div className={styles["btn-container"]}>
                    {
                        router.pathname !== '/appliedjobs' ?
                            <JobCardBtn
                                text={
                                    localStorage.getItem("sb-userRole") === "0"
                                        ? "View Applications" : "Apply"
                                }
                                setModalOpen={setModalOpen}
                                setClickedJobID={setClickedJobID}
                                jobID={jobID}
                                applyClicked={applyClicked}
                            />
                            :
                            void 0
                    }
                </div>
            </div>
        </div>
    )
}

export default DashboardItem