import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark as requested
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const favicon = document.querySelector('link[rel="icon"]');
    if (isDarkMode) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
      if (favicon) favicon.href = "/logo-dark.png";
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      if (favicon) favicon.href = "/logo-white.png";
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
