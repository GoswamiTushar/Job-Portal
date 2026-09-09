import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => {},
    setTheme: () => {},
    isDark: true,
});

const STORAGE_KEY = 'jobportal-theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 1. Check local storage
        const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setThemeState(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // 2. Fallback to OS preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme: Theme = prefersDark ? 'dark' : 'light';
            setThemeState(initialTheme);
            document.documentElement.setAttribute('data-theme', initialTheme);
        }

        // 3. Listen for OS theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                const newTheme = e.matches ? 'dark' : 'light';
                setThemeState(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleTheme = () => {
        const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme: mounted ? theme : 'dark',
                toggleTheme,
                setTheme,
                isDark: (mounted ? theme : 'dark') === 'dark',
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
