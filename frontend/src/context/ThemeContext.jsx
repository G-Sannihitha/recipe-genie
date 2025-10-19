// C:\AI_CHATBOT\recipe-genie\frontend\src\context\ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // check saved preference (or system)
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
    if (saved === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    // system default
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  // apply theme changes to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark-mode");
      root.classList.remove("light-mode");
    } else {
      root.classList.add("light-mode");
      root.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // listen to system theme change if "system" chosen
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const updateSystemTheme = (e) => setDarkMode(e.matches);
      mediaQuery.addEventListener("change", updateSystemTheme);
      return () => mediaQuery.removeEventListener("change", updateSystemTheme);
    }
  }, []);

  const value = {
    darkMode,
    setDarkMode: (value) => {
      setDarkMode(value);
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);