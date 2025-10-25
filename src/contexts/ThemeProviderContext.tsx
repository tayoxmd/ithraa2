import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { ThemeData, ThemeVersion } from '@/types/theme';

interface ThemeContextType {
  currentTheme: ThemeVersion | null;
  themes: ThemeVersion[];
  loading: boolean;
  applyTheme: (themeId: string) => Promise<void>;
  applyThemeForUser: (userId: string, themeId: string) => Promise<void>;
  forceThemeForAll: (themeId: string) => Promise<void>;
  refreshThemes: () => Promise<void>;
  previewTheme: (themeData: ThemeData) => void;
  clearPreview: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProviderContext({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeVersion | null>(null);
  const [themes, setThemes] = useState<ThemeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<ThemeData | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadUserTheme();
    } else {
      loadDefaultTheme();
    }
  }, [user, themes]);

  const loadThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('theme_versions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThemes(data as any || []);
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTheme = async () => {
    if (!user?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('theme, force_theme')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const themeId = profile?.force_theme || profile?.theme;
      
      if (themeId) {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          setCurrentTheme(theme);
          applyThemeToDOM(theme.theme_data);
          return;
        }
      }

      loadDefaultTheme();
    } catch (error) {
      console.error('Error loading user theme:', error);
      loadDefaultTheme();
    }
  };

  const loadDefaultTheme = () => {
    const defaultTheme = themes.find(t => t.is_default);
    if (defaultTheme) {
      setCurrentTheme(defaultTheme);
      applyThemeToDOM(defaultTheme.theme_data);
    }
  };

  const applyThemeToDOM = (themeData: ThemeData) => {
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply typography
    if (themeData.typography.base) {
      root.style.setProperty('--font-size-base', themeData.typography.base);
    }
    if (themeData.typography.fontFamily) {
      root.style.setProperty('--font-family', themeData.typography.fontFamily);
    }

    // Apply spacing
    if (themeData.spacing.base) {
      root.style.setProperty('--spacing-base', themeData.spacing.base);
    }

    // Apply container widths
    Object.entries(themeData.container).forEach(([key, value]) => {
      root.style.setProperty(`--container-${key}`, value);
    });

    // Apply border radius
    if (themeData.borderRadius) {
      root.style.setProperty('--radius', themeData.borderRadius);
    }

    // Add theme class to body
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    document.body.classList.add(`theme-${currentTheme?.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const applyTheme = async (themeId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: themeId })
        .eq('id', user.id);

      if (error) throw error;

      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        applyThemeToDOM(theme.theme_data);
      }

      // Log admin action
      await supabase.from('admin_actions').insert({
        user_id: user.id,
        action_type: 'theme_apply',
        entity_type: 'theme',
        entity_id: themeId,
        details: { theme_name: theme?.name }
      });
    } catch (error) {
      console.error('Error applying theme:', error);
      throw error;
    }
  };

  const applyThemeForUser = async (userId: string, themeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: themeId })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        user_id: user?.id,
        action_type: 'theme_apply_user',
        entity_type: 'theme',
        entity_id: themeId,
        details: { target_user_id: userId }
      });
    } catch (error) {
      console.error('Error applying theme for user:', error);
      throw error;
    }
  };

  const forceThemeForAll = async (themeId: string) => {
    if (!user?.id) return;

    try {
      // Update all users' force_theme field
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ force_theme: themeId })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (updateError) throw updateError;

      // Log admin action
      await supabase.from('admin_actions').insert({
        user_id: user.id,
        action_type: 'theme_force_all',
        entity_type: 'theme',
        entity_id: themeId,
        details: { forced_globally: true }
      });

      await refreshThemes();
    } catch (error) {
      console.error('Error forcing theme:', error);
      throw error;
    }
  };

  const refreshThemes = async () => {
    await loadThemes();
    if (user?.id) {
      await loadUserTheme();
    } else {
      loadDefaultTheme();
    }
  };

  const previewTheme = (themeData: ThemeData) => {
    setPreviewData(themeData);
    applyThemeToDOM(themeData);
  };

  const clearPreview = () => {
    setPreviewData(null);
    if (currentTheme) {
      applyThemeToDOM(currentTheme.theme_data);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        loading,
        applyTheme,
        applyThemeForUser,
        forceThemeForAll,
        refreshThemes,
        previewTheme,
        clearPreview,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within ThemeProviderContext');
  }
  return context;
}
