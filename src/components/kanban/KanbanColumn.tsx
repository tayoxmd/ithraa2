import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KanbanTask } from './KanbanTask';

interface Task {
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
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ 
  id, 
  title, 
  tasks, 
  color, 
  onAddTask, 
  onTaskClick 
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <Card className="flex-1 min-w-[320px] bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="secondary" className="ml-1">
              {tasks.length}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={onAddTask}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent 
        ref={setNodeRef}
        className="min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto"
      >
        <SortableContext 
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              لا توجد مهام
            </div>
          ) : (
            tasks.map(task => (
              <KanbanTask 
                key={task.id} 
                task={task} 
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}