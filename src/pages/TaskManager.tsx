import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid, Settings, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaskVisibilitySettings } from '@/components/kanban/TaskVisibilitySettings';

export default function TaskManager() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);

  const canManageSettings = userRole === 'admin' || userRole === 'manager' || userRole === 'assistant_manager';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-4 md:p-6 pt-10 md:pt-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin-dashboard')}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 md:w-8 md:h-8" />
                {t({ ar: 'إدارة المهام', en: 'Task Manager' })}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {t({ 
                  ar: 'نظام السحب والإفلات لإدارة المهام والطلبات', 
                  en: 'Drag and drop task management system' 
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {canManageSettings && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/task-categories')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t({ ar: 'التصنيفات', en: 'Categories' })}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibilityDialogOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {t({ ar: 'خصائص', en: 'Settings' })}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Kanban Board - Full width */}
        <KanbanBoard />
      </div>

      <TaskVisibilitySettings
        open={visibilityDialogOpen}
        onOpenChange={setVisibilityDialogOpen}
      />
    </div>
  );
}