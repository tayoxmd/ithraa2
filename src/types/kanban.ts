import { Database } from '@/integrations/supabase/types';

// Local types for Kanban system until Supabase types update
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  order_index: number;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
  assigned_to?: string | null;
  due_date?: string | null;
  tags?: string[] | null;
  created_by: string;
}

export interface TaskUpdate {
  status?: 'todo' | 'in_progress' | 'done';
  order_index?: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
  };
}

export interface TaskCommentInsert {
  task_id: string;
  user_id: string;
  comment: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
}

export interface TaskActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  profiles?: {
    full_name?: string;
  };
}

export interface TaskWithDetails extends Task {
  assignee_name?: string;
  comments_count?: number;
  attachments_count?: number;
  profiles?: {
    full_name?: string;
  };
}
