import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";
import DOMPurify from 'dompurify';

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const { settings } = useSettings();
  
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  // If loader is disabled, return null
  if (!settings.loaderEnabled) {
    return null;
  }

  // If custom loader is enabled and HTML is provided
  if (settings.loaderType === 'custom' && settings.loaderCustomHTML) {
    // Sanitize custom HTML to prevent XSS attacks
    const cleanHTML = DOMPurify.sanitize(settings.loaderCustomHTML, {
      ALLOWED_TAGS: ['div', 'span', 'p', 'svg', 'circle', 'path', 'rect', 'polygon', 'ellipse', 'line', 'polyline', 'g'],
      ALLOWED_ATTR: ['class', 'style', 'width', 'height', 'viewBox', 'd', 'cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width', 'transform', 'x', 'y', 'rx', 'ry', 'points', 'x1', 'x2', 'y1', 'y2'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
      FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onmouseout', 'onmousemove', 'onmousedown', 'onmouseup', 'onfocus', 'onblur', 'onchange', 'onsubmit']
    });
    
    return (
      <div 
        className={cn("relative inline-block", className)}
        dangerouslySetInnerHTML={{ __html: cleanHTML }}
      />
    );
  }

  // Default spinner
  return (
    <div className={cn("relative inline-block", className)}>
      <div 
        className={cn(
          "rounded-full border-solid border-primary/20 animate-spin",
          sizeClasses[size]
        )}
        style={{
          borderTopColor: "hsl(var(--primary))",
          animationDuration: `${settings.loaderSpeedMs}ms`
        }}
      />
    </div>
  );
}
