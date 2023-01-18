import React from 'react'
import styles from './styles.module.scss'
import PostJobCard from '../../components/Cards/PostJobCard'
import BreadCrumb from '../../components/Breadcrumb'
import MyJobMetaData from '../../components/MyJobMetaData'


const index = () => {
    return (
        <section className={styles['post-job']}>
            <MyJobMetaData
                title='Post a Job'
                description='Recruiters can post the job from here'
            />
            <BreadCrumb paths={[
                {
                    name: "Post a job",
                    path: '/postjob'
                },
            ]} />
            <PostJobCard />
        </section>
    )
}

export default index