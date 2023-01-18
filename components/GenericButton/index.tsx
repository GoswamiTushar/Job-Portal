import { HtmlProps } from 'next/dist/shared/lib/html-context'
import { ButtonHTMLAttributes, DetailedHTMLProps, FC, HTMLProps, ReactNode, useEffect, useState } from 'react'
import styles from './styles.module.scss'

interface Text {
    text: string,
    disabled?: boolean
    type?: any,
    handleFunction?: () => void,
}

const Index: React.FC<Text> = ({ type, text, disabled = false, handleFunction = null }) => {

    const [clicked, setClicked] = useState(false)
    return (
        <button
            type={type}
            className={!clicked ? styles['generic-btn'] : styles['disabled-generic-btn']}
            disabled={disabled}
        >
            {text}
        </button>
    )
}

export default Index
