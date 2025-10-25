import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TaskManager() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-6 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin-dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <LayoutGrid className="w-8 h-8" />
                {t({ ar: 'إدارة المهام', en: 'Task Manager' })}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t({ 
                  ar: 'نظام السحب والإفلات لإدارة المهام والطلبات', 
                  en: 'Drag and drop task management system' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard />
      </div>
    </div>
  );
}