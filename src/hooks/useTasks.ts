import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type TaskStatus = "new" | "pending" | "delegated" | "confirmed" | "approved";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskType = "financial" | "administrative" | "scheduling";

export interface Task {
  id: string;
  title: string;
  description?: string;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  created_by?: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  financial_amount?: number;
  vault_id?: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  assignee_name?: string;
}

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [
        ...new Set([
          ...tasksData.map((t) => t.created_by).filter(Boolean),
          ...tasksData.map((t) => t.assigned_to).filter(Boolean),
        ]),
      ];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profileMap = new Map(
          profiles?.map((p) => [p.id, p.full_name]) || []
        );

        return tasksData.map((task) => ({
          ...task,
          creator_name: task.created_by
            ? profileMap.get(task.created_by)
            : undefined,
          assignee_name: task.assigned_to
            ? profileMap.get(task.assigned_to)
            : undefined,
        })) as Task[];
      }

      return tasksData as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { title, description, task_type, status, priority, assigned_to, due_date, financial_amount, vault_id } = task;
      
      const { data, error } = await supabase
        .from("tasks")
        .insert([{
          title: title || "",
          description,
          task_type,
          status,
          priority,
          assigned_to,
          due_date,
          financial_amount,
          vault_id,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const updates: Partial<Task> = { status };
      if (status === "approved") {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(`Failed to update task status: ${error.message}`);
    },
  });

  const assignTask = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ assigned_to: userId })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task assigned successfully");
    },
    onError: (error) => {
      toast.error(`Failed to assign task: ${error.message}`);
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  };
}
