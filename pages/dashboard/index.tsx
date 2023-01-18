import { useRouter } from 'next/router'
import { FC, useEffect, useState, useContext, useRef } from 'react'
import { authContext } from '../_app'
import MyJobMetaData from '../../components/MyJobMetaData'
import { getAvailableJobs } from '../../utils/apis'
import BreadCrumb from '../../components/Breadcrumb'
import DashboardContainer from '../../components/DashboardContainer'
import Paginate from '../../components/Paginate'
import NoData from './NoData'
import { applyJob } from '../../utils/apis'
import styles from './styles.module.scss'
import Loader from '../../components/Loader'

const index: FC = () => {
    const [result, setResult] = useState<any>()
    const [itemsToShow, setItemsToShow] = useState([])
    const [pageNo, setPageNo] = useState(1)
    const [total, setTotal] = useState(0)
    const [selectedJobID, setClickedJobID] = useState<any>()
    const [isLoading, setLoading] = useState(true)
    const router = useRouter()
    const userContext = useContext(authContext)
    const applyClicked = useRef(false)
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        // console.log(userContext)
        if (localStorage.getItem("squareboatJobPortalToken") === null) {
            router.push("/")
        }
        setLoading(true)
        if (applyClicked.current) {
            try {
                const apply = async () => {
                    const result = await applyJob(
                        {
                            token: (typeof window !== 'undefined'
                                &&
                                localStorage.getItem("squareboatJobPortalToken"))
                                ?
                                localStorage.getItem("squareboatJobPortalToken")
                                :
                                void 0,
                            jobID: selectedJobID,
                        }
                    ).finally(() => setLoading(false))
                    result?.success === true ?
                        router.push("/appliedjobs")
                        :
                        // console.log(result)
                        null
                    setLoading(false)
                }
                apply()
            }
            finally {
            }
        }
        else {
            applyClicked.current = false
        }
    }, [selectedJobID])

    useEffect(() => {
        const page: string = router?.query.page as string
        async function getData() {
            setPageNo(parseInt(page))
            try {
                const res = await getAvailableJobs(
                    {
                        token:
                            `${typeof window !== 'undefined'
                            &&
                            localStorage.getItem("squareboatJobPortalToken")}`,
                        page: router.query.page !== undefined ? page : "1",
                    })
                setResult(res)
                setItemsToShow(res.data)
                setTotal((parseInt(res?.metadata?.count)))
                setLoading(false)
            } finally {
            }
        }
        getData()
    }, [router.query.page])
    if (!hasMounted) {
        return null;
    }
    else return (
        <section className={styles['dashboard']} suppressHydrationWarning>
            <MyJobMetaData
                title='Available Jobs for you-Candidate Dashboard'
                description='Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio fugit perferendis ex impedit debitis totam omnis. Nobis quisquam voluptate veritatis rerum eveniet hic quasi deleniti, earum dolore veniam sequi molestias libero enim ipsum sapiente. Est dicta ducimus rerum nesciunt laudantium!'
            />
            <BreadCrumb />
            <header>
                {
                    typeof window !== 'undefined' && localStorage.getItem("sb-userRole") === "0"
                        ?
                        <h1 className={styles['page-title']}>
                            Jobs posted by you
                        </h1>
                        :
                        <h1 className={styles['page-title']}>
                            Jobs for you
                        </h1>
                }
            </header>
            {
                (itemsToShow?.length > 0) ?
                    <>

                        {
                            result &&
                            <DashboardContainer
                                applyClicked={applyClicked}
                                setClickedJobID={setClickedJobID}
                                message={result?.message}
                                successStatus={true}
                                itemsToShow={itemsToShow} />
                        }


                        {
                            result &&
                            <Paginate
                                pageNo={pageNo as unknown as string}
                                items={result}
                                totalItems={total}
                                itemsPerPage={20} />
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