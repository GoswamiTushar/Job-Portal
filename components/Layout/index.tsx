import Navbar from '../Navbar'
import DarkBG from '../DarkBG'
import styles from './LayoutStyle.module.scss'


type Props = {
    children?: React.ReactNode;
    size?: string,
};
const Layout = ({ children, size = 'big' }: Props) => {
    return (
        <div className={`${styles['layout-container']}}`}>
            <Navbar />
            {children}
        </div>
    )
}
export default Layout