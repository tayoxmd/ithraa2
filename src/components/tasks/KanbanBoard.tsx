import { useState, useEffect, useMemo } from "react";
import { Task, TaskStatus, useTasks } from "@/hooks/useTasks";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, SortAsc } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const statusColumns: { id: TaskStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "pending", label: "Pending" },
  { id: "delegated", label: "Delegated" },
  { id: "confirmed", label: "Confirmed" },
  { id: "approved", label: "Approved" },
];

export function KanbanBoard() {
  const { tasks, updateTaskStatus, deleteTask, refetch } = useTasks();
  const { settings } = useTaskSettings();
  const isMobile = useIsMobile();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [mobileSelectedStatus, setMobileSelectedStatus] = useState<TaskStatus | null>("new");

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((task) => task.task_type === filterType);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "due_date":
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [tasks, searchQuery, filterType, filterPriority, sortBy]);

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((task) => task.status === status);
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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Task Manager</h1>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="administrative">Administrative</SelectItem>
              <SelectItem value="scheduling">Scheduling</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {isMobile ? (
          // Mobile: Sidebar view with status selection
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {statusColumns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <Button
                    key={column.id}
                    variant={mobileSelectedStatus === column.id ? "default" : "outline"}
                    onClick={() => setMobileSelectedStatus(column.id)}
                    className="flex-shrink-0"
                    style={{
                      borderBottom: mobileSelectedStatus === column.id 
                        ? `3px solid ${colorScheme[column.id]}` 
                        : undefined,
                    }}
                  >
                    {column.label} ({columnTasks.length})
                  </Button>
                );
              })}
            </div>

            <ScrollArea className="h-[calc(100vh-20rem)]">
              {mobileSelectedStatus && (
                <div className="space-y-3">
                  <SortableContext
                    items={getTasksByStatus(mobileSelectedStatus).map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getTasksByStatus(mobileSelectedStatus).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        colorScheme={colorScheme}
                      />
                    ))}
                  </SortableContext>
                  {getTasksByStatus(mobileSelectedStatus).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No tasks in this status
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          // Desktop: Kanban columns
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
        )}

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
