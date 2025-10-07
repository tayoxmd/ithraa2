import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const ChatWidget = () => {
  const [chatCode, setChatCode] = useState<string>('');

  useEffect(() => {
    const fetchChatCode = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('chat_widget_code')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching chat code:', error);
          return;
        }

        if (data?.chat_widget_code) {
          setChatCode(data.chat_widget_code);
        }
      } catch (error) {
        console.error('Error loading chat widget:', error);
      }
    };

    fetchChatCode();
  }, []);

  useEffect(() => {
    if (!chatCode) return;

    // Extract script src from the HTML code
    const scriptMatch = chatCode.match(/src=["']([^"']+)["']/);
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
  }, [chatCode]);

  return null;
};
