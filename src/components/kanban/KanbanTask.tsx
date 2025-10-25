import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Paperclip, User, DollarSign, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TaskWithDetails } from '@/types/kanban';

interface KanbanTaskProps {
  task: TaskWithDetails;
  onClick: (task: TaskWithDetails) => void;
}

export function KanbanTask({ task, onClick }: KanbanTaskProps) {
  const { language } = useLanguage();
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

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  const categoryIcons = {
    general: Tag,
    financial: DollarSign,
    booking: Calendar,
    support: MessageSquare,
    maintenance: Paperclip,
  };

  const CategoryIcon = task.category ? categoryIcons[task.category as keyof typeof categoryIcons] || Tag : Tag;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 md:p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow mb-2"
      onClick={() => onClick(task)}
    >
      <div className="space-y-2">
        {/* Header with priority and category */}
        <div className="flex items-start justify-between gap-2">
          <div className={`w-1 h-6 rounded-full ${priorityColors[task.priority]}`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-xs md:text-sm line-clamp-2">{task.title}</h4>
          </div>
          {task.category && (
            <CategoryIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Financial Info */}
        {task.is_financial && task.amount_total && (
          <div className="flex items-center gap-2 text-[10px] md:text-xs bg-primary/5 rounded p-1.5 md:p-2">
            <DollarSign className="h-3 w-3 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-primary truncate">
                {task.amount_remaining?.toFixed(2) || '0.00'} {language === 'ar' ? 'ر.س' : 'SAR'}
              </div>
              <div className="text-muted-foreground text-[9px] md:text-[10px] truncate">
                {language === 'ar' ? 'متبقي من' : 'remaining of'} {task.amount_total.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-[9px] md:text-[10px] px-1 py-0">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 py-0">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground pt-1 md:pt-2 border-t">
          <div className="flex items-center gap-1 md:gap-2">
            {task.due_date && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span className="text-[9px] md:text-[10px]">
                  {format(new Date(task.due_date), 'd MMM', {
                    locale: language === 'ar' ? ar : undefined,
                  })}
                </span>
              </div>
            )}
            {task.assignee_name && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <User className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span className="text-[9px] md:text-[10px] truncate max-w-[40px] md:max-w-[60px]">
                  {task.assignee_name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {(task.comments_count || 0) > 0 && (
              <div className="flex items-center gap-0.5">
                <MessageSquare className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span className="text-[9px] md:text-[10px]">{task.comments_count}</span>
              </div>
            )}
            {(task.attachments_count || 0) > 0 && (
              <div className="flex items-center gap-0.5">
                <Paperclip className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span className="text-[9px] md:text-[10px]">{task.attachments_count}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}