import { FC, Fragment, useEffect } from 'react'
import Link from 'next/link'
// import styles from './styles.module.scss'
import styles from './styles.module.scss'
import { breadCrumbIcons } from "./_icon"

type BreadcrumbObj = {
    name: string,
    path: string,
    icon?: any,
}

interface Test {
    paths: BreadcrumbObj[] | undefined;
}

interface Props {
    paths?: Array<BreadcrumbObj>,
}

var defaultData = {
    defaultPaths: [
        {
            name: "Home",
            path: typeof window !== 'undefined' && localStorage.getItem("sb-userRole") == '0' ? "/postedjobs" : "/dashboard",
            icon: breadCrumbIcons.homeIcon,
        }
    ]
};

// console.log(defaultData.defaultPaths)

const index: FC<Props> = (props) => {

    useEffect(() => {
        defaultData = {
            defaultPaths: [
                {
                    name: "Home",
                    path: typeof window !== 'undefined' && localStorage.getItem("sb-userRole") == '0' ? "/postedjobs" : "/dashboard",
                    icon: breadCrumbIcons.homeIcon,
                }
            ]
        };
    }, [])

    const propsData = props?.paths

    const locationData: Test = {
        paths: [...defaultData?.defaultPaths, ...propsData ?? []]
    }
    const breadcrumbsData = locationData?.paths

    return (
        <div className={styles['breadcrumbs-container']}>
            {
                breadcrumbsData?.map((obj: BreadcrumbObj, index: number) => {
                    return (
                        <Fragment key={index.toString()}>
                            {
                                breadcrumbsData?.length > 1
                                    ?
                                    <Link
                                        className={styles['breadcrumb-link']}
                                        href={obj.path}>
                                        <span className={styles["breadcrumb-item"]}>
                                            {
                                                obj?.icon
                                                    ?
                                                    <img src={obj?.icon} alt="icon" />
                                                    :
                                                    void 0
                                            }
                                            <p className={styles['label']}>{obj.name}</p>
                                        </span>
                                    </Link>
                                    :
                                    <Link href={obj.path}>
                                        <span className={styles["breadcrumb-item"]}>
                                            {
                                                obj?.icon
                                                    ?
                                                    <img src={obj?.icon} alt="icon" />
                                                    :
                                                    void 0
                                            }
                                            <p className={styles['label']}>{obj.name}</p>
                                        </span>
                                    </Link>
                            }
                            {
                                index !== (breadcrumbsData?.length - 1)
                                    ?
                                    <span className={styles["seperator"]}>
                                        &#62;
                                    </span>
                                    :
                                    void 0
                            }
                        </Fragment>
                    )
                })
            }
        </div>
    )
}

export default index