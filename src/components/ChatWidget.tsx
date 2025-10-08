import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const ChatWidget = () => {
  const [tidioCode, setTidioCode] = useState<string>('');

  useEffect(() => {
    const fetchTidioCode = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('tidio_widget_code, created_at, updated_at')
          .order('created_at', { ascending: false })
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching tidio code:', error);
          return;
        }

        if (data?.tidio_widget_code) {
          setTidioCode(data.tidio_widget_code);
        }
      } catch (error) {
        console.error('Error loading tidio widget:', error);
      }
    };

    fetchTidioCode();
  }, []);

  useEffect(() => {
    if (!tidioCode) return;

    // Extract script src from the HTML code
    const scriptMatch = tidioCode.match(/src=["']([^"']+)["']/);
    if (!scriptMatch) return;

    const scriptSrc = scriptMatch[1];
    
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) return;

    // Create and inject the script
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      const scriptToRemove = document.querySelector(`script[src="${scriptSrc}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [tidioCode]);

  return null;
};
