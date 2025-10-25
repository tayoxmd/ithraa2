import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TaskSettings {
  id: string;
  user_id: string;
  drag_speed: number;
  show_animations: boolean;
  color_scheme: {
    new: string;
    pending: string;
    delegated: string;
    confirmed: string;
    approved: string;
  };
  created_at: string;
  updated_at: string;
}

const defaultColorScheme = {
  new: "#3b82f6",
  pending: "#f59e0b",
  delegated: "#8b5cf6",
  confirmed: "#10b981",
  approved: "#059669",
};

export function useTaskSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["task-settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_settings")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      
      // Return default settings if none exist
      if (!data) {
        return {
          drag_speed: 1.0,
          show_animations: true,
          color_scheme: defaultColorScheme,
        };
      }
      
      return data as TaskSettings;
    },
    enabled: !!user,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<TaskSettings>) => {
      const { data: existing } = await supabase
        .from("task_settings")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("task_settings")
          .update(updates)
          .eq("user_id", user?.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("task_settings")
          .insert([{ ...updates, user_id: user?.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-settings", user?.id] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
}
