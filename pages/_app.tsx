import type { AppProps } from "next/app";
import { ReactNode, useState, createContext } from "react";
import DarkBG from '../components/DarkBG'
import '../styles/_globals.scss'
import Layout from "../components/Layout";

type Props = AppProps & {
  Component: ReactNode;
};

export const authContext = createContext({
  isAuthenticated: false,
  setLogin: () => { },
  setLogout: () => { }
})

function MyApp({ Component, pageProps }: Props) {
  const [isAuthenticated, setIsAuth] = useState(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("squareboatJobPortalToken") : null
    return token !== null
  })
  const setLogin = () => setIsAuth(true)
  const setLogout = () => setIsAuth(false)
  return (
    <authContext.Provider value={{ isAuthenticated, setLogin, setLogout }}>
      <DarkBG />
      <Layout size='small'>
        <Component {...pageProps} />
      </Layout>
    </authContext.Provider>
  )
}
export default MyApp