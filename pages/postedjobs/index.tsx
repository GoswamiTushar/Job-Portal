import { useRouter } from 'next/router'
import { FC, ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import { getPostedJobs } from '../../utils/apis'
import BreadCrumb from '../../components/Breadcrumb'
import DashboardContainer from '../../components/DashboardContainer'
import Paginate from '../../components/Paginate'
import Modal from '../../components/Modal'
import { getOneJobDetails } from '../../utils/apis'
import MyJobMetaData from '../../components/MyJobMetaData'
import NoData, { NoDataModal } from './NoData'
import Loader from '../../components/Loader'
import styles from './styles.module.scss'

const icons = {
    closeIcon: '/icons/modal/close.png',
    noData: '/icons/NoData/resume.png'
}

interface ModalCard {
    name: string,
    email: string,
    skills: string,
}

const ModalCard = ({ name = "", email, skills }: ModalCard) => {
    return (
        <div className={styles['card']}>
            <div className={styles["applicant-info"]}>
                <div className={styles["image-container"]}>
                    {name.substr(0, 1)}
                </div>
                <div className={styles["name-email"]}>
                    <div className={styles["name"]}>{name}</div>
                    <div className={styles["email"]}>{email}</div>
                </div>
            </div>
            <div className={styles["skills-container"]}>
                <div className={styles["label"]}>Skills</div>
                <div className={styles["skills"]}>{skills}</div>
                <span className={styles['skills-tooltip']}>{skills}</span>
            </div>
        </div>
    )
}

const PostedJob: FC = () => {

    const [result, setResult] = useState<any>()
    const [pageNo, setPageNo] = useState('1')
    const [itemsToShow, setItemsToShow] = useState([])
    const [total, setTotal] = useState(0)
    const [modalIsOpen, setIsOpen] = useState(false);
    const [allApplications, setAllApplications] = useState([])
    const [clickedJobID, setClickedJobID] = useState('');
    const [isLoading, setLoading] = useState(true)
    const [isModalLoading, setModalLoading] = useState(true)
    const router = useRouter()
    const applyClicked = useRef(false)
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        try {
            setLoading(true)
            const page: string = router?.query.page as string
            const getData = async () => {
                setPageNo(page)
                const res = await getPostedJobs(
                    {
                        token:
                            `${typeof window !== 'undefined'
                            &&
                            localStorage.getItem("squareboatJobPortalToken")}`,
                        page: router.query.page !== undefined ? page : "1",
                    }
                )
                // console.log(res, "res")
                setResult(res)
                setTotal(res?.data?.metadata?.count)
                setItemsToShow(res?.data?.data)
                setLoading(false)
            }
            getData()
        }
        finally {
            // console.log(isLoading)
        }

    }, [router.query.page])

    useEffect(() => {
        setModalLoading(true)
        if (
            typeof window !== 'undefined' && localStorage.getItem("sb-userRole") !== "0"
        ) {
            router.push("/")
        }
        if (modalIsOpen) {
            try {
                if (applyClicked.current) {
                    const getData = async () => {
                        const result = await getOneJobDetails(
                            {
                                token: `${typeof window !== 'undefined'
                                    &&
                                    localStorage.getItem("squareboatJobPortalToken")}`,
                                jobID: clickedJobID,
                            }
                        )
                        result?.success === true ? setAllApplications(result?.data) : null
                        setModalLoading(false)
                    }
                    getData()
                }
                else {
                }
            }
            finally {
                applyClicked.current = false
            }
        }
    }, [clickedJobID, modalIsOpen])

    const wrapperRef = useRef(null);

    function useOutsideAlerter(ref: any) {
        useEffect(() => {
            /**
             * Alert if clicked on outside of element
             */
            function handleClickOutside(event: any) {
                if (ref.current && !ref.current.contains(event.target)) {
                    setIsOpen(false)
                }
            }
            // Bind the event listener
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                // Unbind the event listener on clean up
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }
    useOutsideAlerter(wrapperRef);

    if (!hasMounted) {
        return null;
    }
    else return (
        <section className={styles['posted-jobs']}>
            <MyJobMetaData
                title='Posted Jobs Recruiter Dashboard'
                description='Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio fugit perferendis ex impedit debitis totam omnis. Nobis quisquam voluptate veritatis rerum eveniet hic quasi deleniti, earum dolore veniam sequi molestias libero enim ipsum sapiente. Est dicta ducimus rerum nesciunt laudantium!'
            />
            <BreadCrumb />
            <header>
                <h1 className={styles['page-title']}>
                    Jobs posted by you
                </h1>
            </header>

            {
                itemsToShow?.length > 0
                    ?
                    <>
                        {
                            result &&
                            <DashboardContainer
                                applyClicked={applyClicked}
                                setClickedJobID={setClickedJobID}
                                successStatus={result.success}
                                itemsToShow={itemsToShow}
                                message={result.message}
                                isModalOpen={modalIsOpen}
                                setModalOpen={setIsOpen}
                            />
                        }
                        {
                            result &&
                            <Paginate pageNo={pageNo as string} items={result} totalItems={total} itemsPerPage={20} />
                        }
                    </>
                    :
                    <>
                        {
                            !isLoading ? <NoData />
                                :
                                void 0
                        }
                        {/* <NoData /> */}
                    </>
            }
            <Modal isModalOpen={modalIsOpen} setIsModalOpen={setIsOpen}>
                <div
                    ref={wrapperRef}
                    className={styles['modal-content']}>
                    <div className={styles["content-area"]}>
                        <h3 className={styles["header"]}>
                            <div className={styles["title"]}>
                                Applicants for this job
                            </div>
                            <div className={styles["close-btn"]}>
                                <img
                                    src={icons.closeIcon}
                                    alt="close"
                                    className={styles['btn']}
                                    onClick={() => {
                                        setIsOpen(false)
                                        setAllApplications([])
                                    }
                                    }
                                />
                            </div>
                        </h3>
                        <p className={styles['application-count']}>
                            {`${allApplications?.length === undefined ? 0 : allApplications?.length} applications`}
                        </p>
                        <div className={styles["applications"]}>
                            <div className={styles['content']}>
                                {
                                    allApplications?.length > 0 ?
                                        allApplications.map((obj: { name: string, email: string, skills: string }, index) => {
                                            return <ModalCard
                                                key={obj.email}
                                                name={obj.name}
                                                email={obj.email}
                                                skills={obj?.skills}
                                            />
                                        })
                                        :
                                        !isModalLoading ?
                                            <NoDataModal />
                                            :
                                            void 0
                                }
                            </div>
                        </div>

                    </div>
                </div>
                <Loader isLoading={isModalLoading} />
            </Modal>
            <Loader isLoading={isLoading} />
        </section>
    )
}

export default PostedJob