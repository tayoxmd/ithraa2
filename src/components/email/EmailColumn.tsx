import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EmailCard } from './EmailCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Email } from '@/types/email';

interface EmailColumnProps {
  id: string;
  title: string;
  color: string;
  emails: Email[];
  onEmailClick: (email: Email) => void;
  filterType?: string;
  emailColors?: {
    inbox_color: string;
    sent_color: string;
    trash_color: string;
    spam_color: string;
  };
  selectedEmails?: string[];
  onEmailSelect?: (emailId: string, selected: boolean) => void;
}

export function EmailColumn({ id, title, color, emails, onEmailClick, filterType, emailColors, selectedEmails = [], onEmailSelect }: EmailColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // تحديد اللون بناءً على نوع الفلتر
  let borderColor = color;
  if (filterType && emailColors) {
    if (filterType === 'inbox') borderColor = emailColors.inbox_color;
    else if (filterType === 'sent') borderColor = emailColors.sent_color;
    else if (filterType === 'trash') borderColor = emailColors.trash_color;
    else if (filterType === 'spam') borderColor = emailColors.spam_color;
  }

  return (
    <Card
      ref={setNodeRef}
      className={`h-full flex flex-col border-2 transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      style={{ borderTopColor: borderColor, borderTopWidth: '4px' }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-normal bg-muted px-2 py-1 rounded-full">
            {emails.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2">
        <SortableContext items={emails.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {emails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={() => onEmailClick(email)}
                isSelected={selectedEmails.includes(email.id)}
                onSelect={(selected) => onEmailSelect?.(email.id, selected)}
              />
            ))}
            {emails.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">
                لا توجد رسائل
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

