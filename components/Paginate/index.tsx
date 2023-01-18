import { FC, JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate';
import { icons } from './_static'
import styles from './styles.module.scss'
import { useRouter } from 'next/router';

interface Path {
    path: string,
}
interface Paginate {
    itemsPerPage: number,
}

const LabelIcon = ({ path }: Path) => {
    return (
        <div className={styles["icon-container"]}>
            <img className={styles['icon']} src={path === "next" ? icons.next : icons.previous} alt="next" />
        </div>
    )
}

interface Items {
    currentItems: any,
}

function Items({ currentItems }: Items) {
    return (
        <>
            {currentItems &&
                currentItems.map((item: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined, index: number) => (
                    <div key={index.toString()}>
                        <h3>Item #{item}</h3>
                    </div>
                ))}
        </>
    );
}

interface Paginate {
    itemsPerPage: number,
    items: any,
    totalItems: number,
    itemsToShow?: Array<any>,
    setItemsToShow?: any,
    pageNo?: string,
    setRender?: any,
    isLoading?: boolean
}

const index: FC<Paginate> = ({ itemsPerPage = 20, items, totalItems, itemsToShow, setItemsToShow, pageNo, setRender, isLoading }) => {
    const [currentItems, setCurrentItems] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const router = useRouter()

    // useEffect(() => {
    //     setPageCount(parseInt(pageNo))
    // }, [router.query.page])

    useEffect(() => {
        // setRender(true)
        window.scrollTo(0, 0)
        const endOffset = itemOffset + itemsPerPage;
        // console.log("items: ", items.data)
        if (router.pathname === "/appliedjobs") {
            // console.log("itemsOffSet: ", itemOffset, "\nendOffset: ", endOffset)
            setItemsToShow(items?.data?.slice(itemOffset, endOffset))
            // console.log("sliced items: ", itemsToShow)
        }
        try {
            setCurrentItems(items.data?.slice(itemOffset, endOffset));
        } catch {
            setCurrentItems(items.data.data.slice(itemOffset, endOffset))
        }
        setPageCount(Math.ceil(totalItems / itemsPerPage));

        // setRender(false)
    }, [itemOffset, itemsPerPage]);

    const urlQueryParameter = (queryName: string, queryValue: any): string => {
        const url = new URL(document.location.toString())
        const search_params = url.searchParams
        search_params.set(queryName, queryValue)
        url.search = search_params.toString()
        return url.toString()
    }

    const handlePageClick = (event: { selected: number; }) => {
        // setRender(true)
        const newOffset = (event.selected * itemsPerPage) % parseInt(totalItems as unknown as string);
        setItemOffset(newOffset);

        router.replace(urlQueryParameter('page', event.selected + 1), undefined, { shallow: true })
        // setRender(false)
    };

    return (
        <div className={styles['paginate-container']}>
            <ReactPaginate
                breakLabel="..."
                nextLabel={<LabelIcon path="next" />}
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel={<LabelIcon path="previous" />}
                className={styles['paginate']}
                activeClassName={styles['paginate-active']}
            />
        </div>
    );
}

export default index