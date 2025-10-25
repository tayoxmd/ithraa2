import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, User, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Task, TaskPriority } from "@/hooks/useTasks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  colorScheme?: Record<string, string>;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const typeIcons = {
  financial: DollarSign,
  administrative: User,
  scheduling: Calendar,
};

export function TaskCard({ task, onEdit, onDelete, colorScheme }: TaskCardProps) {
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

  const TypeIcon = typeIcons[task.task_type];
  const statusColor = colorScheme?.[task.status] || "#3b82f6";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <TypeIcon className="w-4 h-4 text-muted-foreground" />
          <Badge className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-semibold mb-2 line-clamp-2">{task.title}</h3>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
        {task.assignee_name && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{task.assignee_name}</span>
          </div>
        )}

        {task.due_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(task.due_date), "MMM dd, yyyy")}</span>
          </div>
        )}

        {task.financial_amount && (
          <div className="flex items-center gap-1 font-medium">
            <DollarSign className="w-3 h-3" />
            <span>${task.financial_amount.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div
        className="mt-3 h-1 rounded-full"
        style={{ backgroundColor: statusColor }}
      />
    </Card>
  );
}
