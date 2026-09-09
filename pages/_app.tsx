import type { AppProps } from "next/app";
import { useState, useEffect, createContext } from "react";
import Head from "next/head";
import { ThemeProvider } from "../context/ThemeContext";
import '../styles/_globals.scss';
import Layout from "../components/Layout";
import { getCurrentUser } from "../utils/apis";

export const authContext = createContext({
  isAuthenticated: false,
  setLogin: () => { },
  setLogout: () => { }
});

function MyApp({ Component, pageProps }: AppProps) {
  const [isAuthenticated, setIsAuth] = useState(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("squareboatJobPortalToken") : null;
    return token !== null;
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await getCurrentUser();
        if (res && res.success && res.data) {
          setIsAuth(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem("sb-userRole", String(res.data.userRole));
            if (!localStorage.getItem("squareboatJobPortalToken")) {
              localStorage.setItem("squareboatJobPortalToken", "cookie_authenticated");
            }
          }
        }
      } catch (err) {
        // Session not active or error
      }
    };
    checkSession();
  }, []);

  const setLogin = () => setIsAuth(true);
  const setLogout = () => setIsAuth(false);

  return (
    <ThemeProvider>
      <Head>
        <title>RoleCrest | Next-Gen Career & Talent Platform</title>
        <meta name="description" content="RoleCrest connects top-tier candidates with forward-thinking companies. Explore curated tech roles with 1-click verification." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/rolecrest-logo.png" />
        <meta property="og:title" content="RoleCrest | Next-Gen Career & Talent Platform" />
        <meta property="og:description" content="Verified jobs, direct recruiter sync, and fast-track hiring." />
        <meta property="og:image" content="/images/rolecrest-logo.png" />
        <meta name="theme-color" content="#4361ee" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('jobportal-theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </Head>
      <authContext.Provider value={{ isAuthenticated, setLogin, setLogout }}>
        <Layout size='small'>
          <Component {...pageProps} />
        </Layout>
      </authContext.Provider>
    </ThemeProvider>
  );
}

export default MyApp;