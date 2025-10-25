import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTask } from './KanbanTask';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskDetailDialog } from './TaskDetailDialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { TaskWithDetails, TaskUpdate } from '@/types/kanban';

type Task = TaskWithDetails;

export function KanbanBoard() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select(`
          *,
          profiles:assigned_to(full_name)
        `)
        .neq('status', 'archived')
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (error) throw error;

      // Fetch counts
      const tasksWithCounts = await Promise.all(
        (data || []).map(async (task: any) => {
          const commentsResult = await (supabase as any)
            .from('task_comments')
            .select('id', { count: 'exact', head: true })
            .eq('task_id', task.id);
          
          const attachmentsResult = await (supabase as any)
            .from('task_attachments')
            .select('id', { count: 'exact', head: true })
            .eq('task_id', task.id);

          const [commentsData, attachmentsData] = [commentsResult, attachmentsResult];

          return {
            ...task,
            assignee_name: task.profiles?.full_name,
            comments_count: commentsData.count || 0,
            attachments_count: attachmentsData.count || 0,
          };
        })
      );

      setTasks(tasksWithCounts as unknown as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error(t({ ar: 'حدث خطأ أثناء تحميل المهام', en: 'Error loading tasks' }));
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        id: 'todo',
        title: t({ ar: 'قيد الانتظار', en: 'To Do' }),
        color: '#94a3b8',
        tasks: tasks.filter((t) => t.status === 'todo'),
      },
      {
        id: 'in_progress',
        title: t({ ar: 'قيد التنفيذ', en: 'In Progress' }),
        color: '#3b82f6',
        tasks: tasks.filter((t) => t.status === 'in_progress'),
      },
      {
        id: 'done',
        title: t({ ar: 'مكتمل', en: 'Done' }),
        color: '#22c55e',
        tasks: tasks.filter((t) => t.status === 'done'),
      },
    ];
  }, [tasks, t]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped on a column
    const overColumn = columns.find((col) => col.id === over.id);
    if (overColumn && activeTask.status !== overColumn.id) {
      // Update task status
      await updateTaskStatus(activeTask.id, overColumn.id as any);
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && active.id !== over.id) {
      // Reorder tasks within the same column
      if (activeTask.status === overTask.status) {
        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);
        const newTasks = arrayMove(tasks, oldIndex, newIndex);

        // Update order_index for all tasks in the affected column
        const statusTasks = newTasks.filter((t) => t.status === activeTask.status);
        const updates = statusTasks.map((task, index) => ({
          id: task.id,
          order_index: index,
        }));

        // Optimistic update
        setTasks(newTasks);

        // Update in database
        await Promise.all(
          updates.map((update) =>
            supabase
              .from('tasks' as any)
              .update({ order_index: update.order_index } as any)
              .eq('id', update.id)
          )
        );
      }
    }

    setActiveTask(null);
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'new' | 'pending' | 'approved' | 'confirmed' | 'delegated') => {
    try {
      const { error } = await supabase
        .from('tasks' as any)
        .update({ status: newStatus } as any)
        .eq('id', taskId);

      if (error) throw error;

      toast.success(t({ ar: 'تم تحديث حالة المهمة', en: 'Task status updated' }));
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(t({ ar: 'حدث خطأ', en: 'An error occurred' }));
    }
  };

  const handleAddTask = (columnId: 'todo' | 'in_progress' | 'done') => {
    setInitialStatus(columnId);
    setCreateDialogOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={column.tasks}
              color={column.color}
              onAddTask={() => handleAddTask(column.id as any)}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="opacity-80">
              <KanbanTask task={activeTask} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialStatus={initialStatus}
        onTaskCreated={fetchTasks}
      />

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          onTaskUpdated={fetchTasks}
        />
      )}
    </>
  );
}