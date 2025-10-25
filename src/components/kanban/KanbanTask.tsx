import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Paperclip, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface KanbanTaskProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    assigned_to?: string;
    assignee_name?: string;
    comments_count?: number;
    attachments_count?: number;
    tags?: string[];
  };
  onClick: () => void;
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-700 border-slate-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300',
};

const priorityLabels = {
  ar: { low: 'منخفضة', medium: 'متوسطة', high: 'عالية', urgent: 'عاجلة' },
  en: { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' },
};

export function KanbanTask({ task, onClick }: KanbanTaskProps) {
  const { language, t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const borderLeftColor = task.priority === 'urgent' ? '#ef4444' : 
                          task.priority === 'high' ? '#f97316' :
                          task.priority === 'medium' ? '#3b82f6' : '#64748b';

  return (
    <Card
      ref={setNodeRef}
      style={{ ...style, borderLeftColor }}
      {...attributes}
      {...listeners}
      className="p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm leading-tight flex-1">{task.title}</h4>
        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${priorityColors[task.priority]}`}>
          <Flag className="w-3 h-3 mr-1" />
          {priorityLabels[language][task.priority]}
        </Badge>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(task.due_date), 'd MMM', { 
                  locale: language === 'ar' ? ar : undefined 
                })}
              </span>
            </div>
          )}

          {/* Comments Count */}
          {task.comments_count && task.comments_count > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments_count}</span>
            </div>
          )}

          {/* Attachments Count */}
          {task.attachments_count && task.attachments_count > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments_count}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee_name && (
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(task.assignee_name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  );
}