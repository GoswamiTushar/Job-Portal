import { FC } from 'react'
import WhyUsCard from '../../Cards/WhyUsCard'
import { cardsContent } from './_info'
import styles from './styles.module.scss'

type CardContent = {
    heading: string,
    description: string,
}

const index: FC = () => {
    return (
        <div className={styles["why-us"]} >
            <div className={styles["heading"]}>
                <h2>Why Us</h2>
            </div>
            <div className={styles["cards-section"]}>
                {
                    cardsContent.map((obj: CardContent, index: number) => {
                        return <WhyUsCard key={index.toString()} title={obj.heading} desc={obj.description} />
                    })
                }
            </div>
        </div>
    )
}

export default index
