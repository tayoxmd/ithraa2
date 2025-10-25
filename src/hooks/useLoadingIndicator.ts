import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { IndicatorAsset, ViewportType } from '@/types/theme';

interface IndicatorConfig {
  speed: number;
  size: number;
  color?: string;
  autoHide: boolean;
  viewport: ViewportType;
}

export function useLoadingIndicator() {
  const [currentIndicator, setCurrentIndicator] = useState<IndicatorAsset | null>(null);
  const [config, setConfig] = useState<IndicatorConfig>({
    speed: 1000,
    size: 40,
    autoHide: true,
    viewport: getViewportType()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveIndicator();
    
    // Listen for viewport changes
    const handleResize = () => {
      setConfig(prev => ({ ...prev, viewport: getViewportType() }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadActiveIndicator = async () => {
    try {
      const { data, error } = await supabase
        .from('indicator_assets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCurrentIndicator(data as any);
        applyViewportRules(data as any, config.viewport);
      }
    } catch (error) {
      console.error('Error loading indicator:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyViewportRules = (indicator: IndicatorAsset, viewport: ViewportType) => {
    const rules = indicator.viewport_rules[viewport];
    
    setConfig(prev => ({
      ...prev,
      speed: rules.speed || prev.speed,
      size: rules.size || prev.size,
      color: rules.color || prev.color,
      autoHide: rules.autoHide !== undefined ? rules.autoHide : prev.autoHide
    }));
  };

  const getIndicatorStyles = () => {
    return {
      width: `${config.size}px`,
      height: `${config.size}px`,
      animationDuration: `${config.speed}ms`,
      color: config.color
    };
  };

  const getIndicatorHTML = (): string => {
    if (!currentIndicator) {
      return ''; // Will use default component
    }

    if (currentIndicator.asset_type === 'svg') {
      return currentIndicator.asset_data;
    }

    return '';
  };

  return {
    indicator: currentIndicator,
    config,
    loading,
    getIndicatorStyles,
    getIndicatorHTML,
    refreshIndicator: loadActiveIndicator
  };
}

function getViewportType(): ViewportType {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
