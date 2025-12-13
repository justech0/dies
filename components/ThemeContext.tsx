import React, { createContext, useContext, useEffect, useState } from 'react';

// Simplified Theme Context - Always 'brand' mode (No dark/black mode)
interface ThemeContextType {
  isDark: boolean; // Kept for interface compatibility but will always be false
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We enforce the light/brand theme structure defined in CSS
  useEffect(() => {
    document.body.style.backgroundColor = '#F0F4F8';
    document.body.style.color = '#001e3c';
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return { isDark: false, theme: 'light', toggleTheme: () => {} };
};