import { useRouter } from 'next/router'
import { FC, Key, useEffect, useState, Fragment } from 'react'
import DashboardItem from './DashboardItem'
import styles from './styles.module.scss'

interface Result {
    successStatus: boolean,
    message: string,
    itemsToShow?: any,
    isModalOpen?: boolean,
    setModalOpen?: any,
    setClickedJobID?: any,
    applyClicked?: any
}

type Obj = {
    id: Key | null | undefined,
    title: string,
    description: string,
    location: string,
}

const index: FC<Result> = ({
    successStatus,
    message,
    itemsToShow,
    isModalOpen,
    setModalOpen,
    setClickedJobID,
    applyClicked
}) => {
    const router = useRouter()

    // useEffect(() => {
    //     window.addEventListener("load", () => {
    //         setLoading(true)
    //     });
    //     return () => {
    //         setLoading(false)
    //         window.removeEventListener("load", () => setLoading(false))
    //     }
    // }, [])

    return (
        <div className={styles['dashboard-container']} suppressHydrationWarning>
            {
                successStatus === true && itemsToShow?.length > 0
                    ?
                    itemsToShow?.map((obj: Obj, index: number) => {
                        return (
                            <Fragment key={index.toString()}>
                                <DashboardItem
                                    // key={obj.id?.toString()}
                                    jobTitle={obj.title}
                                    jobDesc={obj.description}
                                    jobLocation={obj.location}
                                    jobID={obj.id}
                                    setClickedJobID={setClickedJobID}
                                    allApplications={undefined}
                                    setAllApplications={undefined}
                                    setModalOpen={setModalOpen}
                                    applyClicked={applyClicked}
                                />
                            </Fragment>
                        )
                    })
                    :
                    // console.log(message)
                    alert("Some error occured")
            }

        </div>
    )
}

export default index