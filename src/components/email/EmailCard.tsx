import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Mail, Reply, Clock, Paperclip, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Email } from '@/types/email';

interface EmailCardProps {
  email: Email;
  onClick?: () => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function EmailCard({ email, onClick, isDragging, isSelected, onSelect }: EmailCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: email.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const timeAgo = formatDistanceToNow(new Date(email.created_at), {
    addSuffix: true,
    locale: ar,
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // تجنب فتح البريد عند النقر على checkbox
        if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
          return;
        }
        onClick?.();
      }}
      className={`cursor-move p-3 hover:shadow-md transition-all ${
        !email.is_read ? 'bg-blue-50 border-blue-200' : ''
      } ${email.priority === 'high' ? 'border-l-4 border-l-red-500' : ''} ${
        email.has_replies && email.reply_count > 0 ? 'border-r-4 border-r-green-500 bg-green-50/30' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      {onSelect && (
        <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(!!checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-sm font-semibold truncate">{email.subject}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {email.from_name} &lt;{email.from_email}&gt;
          </p>
        </div>
        <div className="flex items-center gap-1">
          {email.has_replies && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              <Reply className="w-3 h-3" />
              <span>{email.reply_count}</span>
            </div>
          )}
          {email.attachments && email.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              <span>{email.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {email.body}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
        {email.priority === 'high' && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
            عاجل
          </span>
        )}
      </div>
    </Card>
  );
}

