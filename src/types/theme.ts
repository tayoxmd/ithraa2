export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
}

export interface ThemeSpacing {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

export interface ThemeTypography {
  base: string;
  scale: number;
  fontFamily?: string;
  headingFamily?: string;
}

export interface ThemeContainer {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface ThemeData {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  container: ThemeContainer;
  borderRadius?: string;
  shadows?: Record<string, string>;
}

export interface ThemeVersion {
  id: string;
  name: string;
  version: number;
  theme_data: ThemeData;
  is_default: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserThemePreference {
  userId: string;
  theme: string | null;
  forceTheme: string | null;
  preferences: Record<string, any>;
}

export type ViewportType = 'mobile' | 'tablet' | 'desktop';

export interface IndicatorAsset {
  id: string;
  name: string;
  description?: string;
  asset_type: 'svg' | 'json' | 'js';
  asset_data: string;
  thumbnail_url?: string;
  metadata: Record<string, any>;
  is_active: boolean;
  viewport_rules: {
    mobile: Record<string, any>;
    tablet: Record<string, any>;
    desktop: Record<string, any>;
  };
  created_by?: string;
  created_at: string;
  updated_at: string;
}
