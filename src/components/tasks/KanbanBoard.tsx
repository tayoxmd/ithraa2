import { useState } from "react";
import { Task, TaskStatus, useTasks } from "@/hooks/useTasks";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTaskSettings } from "@/hooks/useTaskSettings";
import { ScrollArea } from "@/components/ui/scroll-area";

const statusColumns: { id: TaskStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "pending", label: "Pending" },
  { id: "delegated", label: "Delegated" },
  { id: "confirmed", label: "Confirmed" },
  { id: "approved", label: "Approved" },
];

export function KanbanBoard() {
  const { tasks, updateTaskStatus, deleteTask } = useTasks();
  const { settings } = useTaskSettings();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    if (statusColumns.some((col) => col.id === newStatus)) {
      updateTaskStatus.mutate({ id: taskId, status: newStatus });
    }

    setActiveTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(id);
    }
  };

  const handleCreateNew = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const colorScheme = settings?.color_scheme || {
    new: "#3b82f6",
    pending: "#f59e0b",
    delegated: "#8b5cf6",
    confirmed: "#10b981",
    approved: "#059669",
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div
                key={column.id}
                className="flex flex-col bg-muted/30 rounded-lg p-4"
                style={{
                  borderTop: `4px solid ${colorScheme[column.id]}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">{column.label}</h2>
                  <span className="text-sm text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>

                <ScrollArea className="flex-1 pr-4">
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        colorScheme={colorScheme}
                      />
                    ))}
                  </SortableContext>
                </ScrollArea>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onEdit={handleEdit}
              onDelete={handleDelete}
              colorScheme={colorScheme}
            />
          )}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
      />
    </div>
  );
}
