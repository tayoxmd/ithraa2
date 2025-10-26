import { useState } from 'react';
import { MoreVertical, MessageCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import type { TaskWithDetails } from '@/types/kanban';

interface TaskActionMenuProps {
  task: TaskWithDetails;
  onTaskDeleted: () => void;
  taskRef?: React.RefObject<HTMLDivElement>;
}

export function TaskActionMenu({ task, onTaskDeleted, taskRef }: TaskActionMenuProps) {
  const { t, language } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const shareToWhatsApp = async () => {
    try {
      if (!taskRef?.current) {
        toast.error(t({ ar: 'حدث خطأ في تحميل المهمة', en: 'Error loading task' }));
        return;
      }

      // Capture task card as image
      const canvas = await html2canvas(taskRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `task-${task.id}.png`, { type: 'image/png' });

        // Get assignee phone
        let phone = '';
        if (task.assigned_to) {
          const { data } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', task.assigned_to)
            .single();
          phone = data?.phone || '';
        }

        if (!phone) {
          toast.error(t({ ar: 'رقم الهاتف غير موجود', en: 'Phone number not found' }));
          return;
        }

        // Open WhatsApp
        const text = `${t({ ar: 'مهمة جديدة:', en: 'New Task:' })} ${task.title}`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');

        toast.success(t({ ar: 'تم فتح واتساب', en: 'WhatsApp opened' }));
      });
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      toast.error(t({ ar: 'حدث خطأ', en: 'An error occurred' }));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'archived' })
        .eq('id', task.id);

      if (error) throw error;

      toast.success(t({ ar: 'تم حذف المهمة', en: 'Task deleted' }));
      onTaskDeleted();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(t({ ar: 'حدث خطأ', en: 'An error occurred' }));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-5 w-5 absolute top-1 left-1 z-10 hover:bg-accent"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={shareToWhatsApp} className="gap-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            {t({ ar: 'مشاركة عبر واتساب', en: 'Share via WhatsApp' })}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2 text-red-500 focus:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
            {t({ ar: 'حذف المهمة', en: 'Delete Task' })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t({ ar: 'تأكيد الحذف', en: 'Confirm Deletion' })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t({ 
                ar: 'هل أنت متأكد من حذف هذه المهمة؟ لن تتمكن من التراجع عن هذا الإجراء.',
                en: 'Are you sure you want to delete this task? This action cannot be undone.'
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t({ ar: 'إلغاء', en: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? t({ ar: 'جاري الحذف...', en: 'Deleting...' }) : t({ ar: 'حذف', en: 'Delete' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
