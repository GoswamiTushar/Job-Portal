import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import MyJobMetaData from '../../components/MyJobMetaData'
import { getAppliedJobs, getCurrentUser } from '../../utils/apis'
import BreadCrumb from '../../components/Breadcrumb'
import DashboardContainer from '../../components/DashboardContainer'
import Paginate from '../../components/Paginate'
import NoData from './NoData'
import Loader from '../../components/Loader'
import styles from './styles.module.scss'

const index: FC = () => {
    const [result, setResult] = useState<any>()
    const [itemsToShow, setItemToShow] = useState<Array<any>>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
        const verifyCandidate = async () => {
            const hasLocalToken = typeof window !== 'undefined' && localStorage.getItem("squareboatJobPortalToken");
            const role = typeof window !== 'undefined' ? localStorage.getItem("sb-userRole") : null;
            if (!hasLocalToken) {
                const userRes = await getCurrentUser();
                if (!userRes?.success || !userRes?.data) {
                    router.push("/");
                    return;
                }
                localStorage.setItem("squareboatJobPortalToken", "cookie_authenticated");
                localStorage.setItem("sb-userRole", String(userRes.data.userRole));
                if (userRes.data.userRole === 0) {
                    router.push("/postedjobs");
                    return;
                }
            } else if (role === "0") {
                router.push("/postedjobs");
                return;
            }

            try {
                const res = await getAppliedJobs({ token: localStorage.getItem("squareboatJobPortalToken") as string });
                setResult(res);
                setItemToShow(res?.data);
                setTotal(res?.data?.length);
            } finally {
                setLoading(false);
            }
        };
        verifyCandidate();
    }, [])

    return (
        <section className={styles['dashboard']}>
            <Loader isLoading={isLoading} />
            <MyJobMetaData
                title='Applied Jobs- Candidate Dashboard'
                description='Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet assumenda aliquid veritatis, eligendi nostrum est nisi beatae deleniti earum exercitationem.'
            />
            <BreadCrumb paths={[
                {
                    name: "Applied Jobs",
                    path: '/appliedjobs'
                },
            ]} />
            <header>
                <h1 className={styles['page-title']}>
                    Jobs applied by you
                </h1>
            </header>

            {
                (itemsToShow?.length > 0)
                    ?
                    <>
                        {
                            itemsToShow &&
                            <DashboardContainer itemsToShow={itemsToShow} successStatus={result.success} message={result.message} />
                        }
                        {
                            result &&
                            <Paginate setRender={setLoading} itemsToShow={itemsToShow} setItemsToShow={setItemToShow} items={result} totalItems={total} itemsPerPage={20} />
                        }
                    </>
                    :
                    !isLoading
                        ?
                        <NoData />
                        :
                        void 0
            }
            <Loader isLoading={isLoading} />
        </section>
    )
}

export default index