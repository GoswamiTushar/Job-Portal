import { FC, Key, Fragment } from 'react';
import DashboardItem from './DashboardItem';
import styles from './styles.module.scss';

interface Result {
    successStatus: boolean;
    message?: string;
    itemsToShow?: any[];
    isModalOpen?: boolean;
    setModalOpen?: any;
    setClickedJobID?: any;
    applyClicked?: any;
}

type Obj = {
    id: Key | null | undefined;
    title: string;
    description: string;
    location: string;
};

const DashboardContainer: FC<Result> = ({
    successStatus,
    itemsToShow,
    setModalOpen,
    setClickedJobID,
    applyClicked,
}) => {
    if (!successStatus || !itemsToShow || itemsToShow.length === 0) {
        return null;
    }

    return (
        <div className={styles['dashboard-container']} suppressHydrationWarning>
            {itemsToShow.map((obj: Obj, index: number) => (
                <Fragment key={obj.id ? obj.id.toString() : index.toString()}>
                    <DashboardItem
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
            ))}
        </div>
    );
};

export default DashboardContainer;