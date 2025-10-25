import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TaskManager() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const canManageSettings = userRole === 'admin' || userRole === 'manager' || userRole === 'assistant_manager';

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Compact Header */}
        <div className="flex-shrink-0 px-3 md:px-6 py-2 md:py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <h1 className="text-base md:text-lg font-semibold">
              {t({ ar: 'المهام', en: 'Tasks' })}
            </h1>
            {canManageSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/task-settings')}
                className="h-8 gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">
                  {t({ ar: 'إعدادات المهام', en: 'Settings' })}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Kanban Board - Full remaining space */}
        <div className="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
      </div>
    </div>
  );
}