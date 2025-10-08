import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const ChatWidget = () => {
  const [tidioPublicKey, setTidioPublicKey] = useState<string>('');

  useEffect(() => {
    const fetchTidioKey = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('tidio_public_key')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching tidio key:', error);
          return;
        }

        if (data?.tidio_public_key) {
          setTidioPublicKey(data.tidio_public_key);
        }
      } catch (error) {
        console.error('Error loading tidio widget:', error);
      }
    };

    fetchTidioKey();
  }, []);

  useEffect(() => {
    if (!tidioPublicKey) return;

    // Build Tidio script URL from public key
    const scriptSrc = `//code.tidio.co/${tidioPublicKey}.js`;
    
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
  }, [tidioPublicKey]);

  return null;
};
