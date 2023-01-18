import { FC } from 'react'
import { companyLogos } from './logos'
import styles from './styles.module.scss'

type ImageObj = {
    company: string,
    image: string,
}

const index: FC = () => {
    return (
        <div className={styles["clients"]} >
            <div className={styles["heading"]}>
                <h2>Companies Who Trust Us</h2>
            </div>
            <div className={styles["company-logos"]}>
                {
                    companyLogos.map((obj: ImageObj) => {
                        return <img key={obj.company} src={obj.image} alt={obj.company} />
                    })
                }
            </div>
        </div>
    )
}

export default index
