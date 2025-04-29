import { useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'user_theme_preference';

export function useColorScheme(): ColorSchemeName {
  const systemColorScheme = _useColorScheme();
  const [userColorScheme, setUserColorScheme] = useState<ColorSchemeName>(systemColorScheme);
  
  // AsyncStorage'dan kullanıcı tema tercihini yükle
  useEffect(() => {
    const loadUserThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        
        if (savedTheme) {
          setUserColorScheme(savedTheme as ColorSchemeName);
        }
      } catch (error) {
        console.error('Tema tercihi yüklenirken hata oluştu:', error);
      }
    };
    
    loadUserThemePreference();
  }, []);

  // Tema değişikliğini dinle ve Toggle Switch çalıştığında güncelle
  useEffect(() => {
    const updateTheme = async () => {
      try {
        if (userColorScheme) {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, userColorScheme);
        }
      } catch (error) {
        console.error('Tema tercihi kaydedilirken hata oluştu:', error);
      }
    };
    
    updateTheme();
  }, [userColorScheme]);

  // useColorScheme hook'u normalde yalnızca değeri döndürür, 
  // ama bizimki hem değeri döndürür hem de değeri değiştirme fonksiyonunu sağlar
  // Bu hook toggle switch tarafından çağrıldığında uygulanacak
  const toggleTheme = () => {
    setUserColorScheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Tema değiştirmek için window objesine bir fonksiyon ekleyelim
  // (Bu, React Native'de global düzeyde erişilebilir olmasını sağlar)
  if (typeof window !== 'undefined') {
    (window as any).__TOGGLE_THEME_FUNCTION__ = toggleTheme;
  }

  return userColorScheme || systemColorScheme;
}
