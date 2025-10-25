import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Tag, Eye, Palette } from 'lucide-react';
import { TaskVisibilitySettings } from '@/components/kanban/TaskVisibilitySettings';

export default function TaskSettings() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);

  const canManageSettings = userRole === 'admin' || userRole === 'manager' || userRole === 'assistant_manager';

  if (!canManageSettings) {
    navigate('/task-manager');
    return null;
  }

  const settingsCards = [
    {
      title: t({ ar: 'التصنيفات', en: 'Categories' }),
      description: t({ ar: 'إدارة تصنيفات المهام', en: 'Manage task categories' }),
      icon: Tag,
      onClick: () => navigate('/task-categories'),
      color: 'text-blue-500'
    },
    {
      title: t({ ar: 'إعدادات العرض', en: 'Display Settings' }),
      description: t({ ar: 'تخصيص خيارات العرض والألوان', en: 'Customize display and colors' }),
      icon: Eye,
      onClick: () => setVisibilityDialogOpen(true),
      color: 'text-purple-500'
    },
    {
      title: t({ ar: 'المظهر', en: 'Appearance' }),
      description: t({ ar: 'تخصيص ألوان وأنماط المهام', en: 'Customize colors and styles' }),
      icon: Palette,
      onClick: () => setVisibilityDialogOpen(true),
      color: 'text-pink-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-4 md:p-6 pt-10 md:pt-14">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/task-manager')}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 md:w-8 md:h-8" />
              {t({ ar: 'إعدادات المهام', en: 'Task Settings' })}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t({ 
                ar: 'تخصيص وإدارة إعدادات نظام المهام', 
                en: 'Customize and manage task system settings' 
              })}
            </p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingsCards.map((setting, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={setting.onClick}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-muted group-hover:scale-110 transition-transform ${setting.color}`}>
                    <setting.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{setting.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{setting.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/task-manager')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t({ ar: 'العودة إلى المهام', en: 'Back to Tasks' })}
          </Button>
        </div>
      </div>

      <TaskVisibilitySettings
        open={visibilityDialogOpen}
        onOpenChange={setVisibilityDialogOpen}
      />
    </div>
  );
}
