import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExpandableListProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  count?: number;
}

export function ExpandableList({ title, icon, children, defaultExpanded = false, count }: ExpandableListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between h-auto p-4 hover:bg-accent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

