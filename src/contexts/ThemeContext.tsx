import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type ThemeType = 'design1' | 'design2' | 'design3';

interface ThemeContextType {
  userTheme: ThemeType;
  adminTheme: ThemeType;
  setUserTheme: (theme: ThemeType) => void;
  setAdminTheme: (theme: ThemeType) => void;
  isAdmin: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const [userTheme, setUserThemeState] = useState<ThemeType>('design1');
  const [adminTheme, setAdminThemeState] = useState<ThemeType>('design1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadThemes() {
      const { data } = await supabase
        .from('site_settings')
        .select('user_theme, admin_theme')
        .single();

      if (data) {
        setUserThemeState((data.user_theme as ThemeType) || 'design1');
        setAdminThemeState((data.admin_theme as ThemeType) || 'design1');
      }
      setLoading(false);
    }

    loadThemes();
  }, []);

  useEffect(() => {
    if (loading) return;

    const currentTheme = isAdmin ? adminTheme : userTheme;
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-design1', 'theme-design2', 'theme-design3');
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${currentTheme}`);
  }, [userTheme, adminTheme, isAdmin, loading]);

  const setUserTheme = (theme: ThemeType) => {
    setUserThemeState(theme);
  };

  const setAdminTheme = (theme: ThemeType) => {
    setAdminThemeState(theme);
  };

  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ userTheme, adminTheme, setUserTheme, setAdminTheme, isAdmin }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
