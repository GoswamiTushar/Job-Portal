import { FC, MouseEventHandler } from 'react'
import styles from './styles.module.scss'

interface OptionProps {
    text: string,
    iconURL: string,
    isSelected?: boolean,
    setIsSelected?: any,
    unselect?: any,
}

const index: FC<OptionProps> = ({ text, iconURL, isSelected, setIsSelected, unselect }) => {
    const handleClick = () => {
        setIsSelected(true)
        unselect(false)
    }
    return (
        <div
            onClick={handleClick}
            className={
                `${styles['option-btn']} ${isSelected ? styles['selected']
                    :
                    styles['not-selected']
                }`
            }>
            <span className={styles["icon-container"]}>
                <img src={iconURL} alt="icon" className={styles["icon"]} />
            </span>
            <span className={styles["text"]}>
                {text}
            </span>
        </div>
    )
}

export default index