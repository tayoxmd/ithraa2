export interface Email {
  id: string;
  subject: string;
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  body: string;
  body_html?: string | null;
  status: string;
  status_id?: string | null;
  filter_id?: string | null;
  has_replies: boolean;
  reply_count: number;
  created_at: string;
  updated_at?: string | null;
  is_read: boolean;
  priority?: 'low' | 'normal' | 'high' | string;
  attachments?: string[] | null;
  hotel_id?: string | null;
  booking_id?: string | null;
  tags?: string[];
}

export interface EmailStatus {
  id: string;
  name_ar: string;
  name_en: string;
  color: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
}

export interface EmailFilter {
  id: string;
  name_ar: string;
  name_en: string;
  filter_type: 'inbox' | 'sent' | 'trash' | 'spam' | 'custom' | string;
  order_index: number;
  is_active: boolean;
}

export interface EmailTag {
  id: string;
  name_ar: string;
  name_en: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailAttachment {
  id: string;
  email_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}
