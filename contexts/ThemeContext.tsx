import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'user_theme_preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const deviceTheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<ThemeType>(
    (deviceTheme as ThemeType) || 'light'
  );

  useEffect(() => {
    // Uygulama başladığında kayıtlı tema tercihini yükle
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Tema tercihi yüklenirken hata oluştu:', error);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    const newTheme: ThemeType = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Tema tercihi kaydedilirken hata oluştu:', error);
    }
  };

  const isDarkTheme = theme === 'dark';

  const contextValue: ThemeContextType = {
    theme,
    isDarkTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 