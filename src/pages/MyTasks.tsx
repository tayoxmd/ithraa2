import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Flag, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { TaskWithDetails } from '@/types/kanban';

export default function MyTasks() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMyTasks();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('my-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${user.id}`
        },
        () => {
          fetchMyTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchMyTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:created_by(full_name)
        `)
        .eq('assigned_to', user.id)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as TaskWithDetails[]);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const statusLabels = {
    todo: { ar: 'قيد الانتظار', en: 'To Do' },
    in_progress: { ar: 'قيد التنفيذ', en: 'In Progress' },
    done: { ar: 'مكتمل', en: 'Done' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
  };

  const priorityLabels = {
    low: { ar: 'منخفضة', en: 'Low' },
    medium: { ar: 'متوسطة', en: 'Medium' },
    high: { ar: 'عالية', en: 'High' },
    urgent: { ar: 'عاجلة', en: 'Urgent' }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-4 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {t({ ar: 'مهامي', en: 'My Tasks' })}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t({ ar: 'المهام المخصصة لك', en: 'Tasks assigned to you' })}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {tasks.length} {t({ ar: 'مهمة', en: 'tasks' })}
          </Badge>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {t({ ar: 'لا توجد مهام مخصصة لك حالياً', en: 'No tasks assigned to you yet' })}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card 
                key={task.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/task-manager')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {task.title}
                    </CardTitle>
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-1 h-8 rounded-full ${getPriorityColor(task.priority)}`} />
                    <div className="flex-1">
                      <Badge variant="outline" className="text-xs">
                        {statusLabels[task.status][language]}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {priorityLabels[task.priority][language]}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Financial Info */}
                  {task.is_financial && task.amount_total && (
                    <div className="bg-primary/5 rounded p-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium text-primary">
                            {task.amount_remaining?.toFixed(2) || '0.00'} {language === 'ar' ? 'ر.س' : 'SAR'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {language === 'ar' ? 'متبقي من' : 'remaining of'} {task.amount_total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Due Date */}
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(task.due_date), 'PPP', {
                          locale: language === 'ar' ? ar : undefined,
                        })}
                      </span>
                    </div>
                  )}

                  {/* Created By */}
                  {task.profiles?.full_name && (
                    <div className="text-xs text-muted-foreground">
                      {t({ ar: 'من:', en: 'From:' })} {task.profiles.full_name}
                    </div>
                  )}

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
