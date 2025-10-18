-- إضافة أعمدة جديدة لجدول pdf_settings لدعم التخصيص الكامل

-- Font settings
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS primary_font VARCHAR DEFAULT 'helvetica';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS secondary_font VARCHAR DEFAULT 'helvetica';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS font_size_header INTEGER DEFAULT 18;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS font_size_title INTEGER DEFAULT 14;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS font_size_body INTEGER DEFAULT 10;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS font_size_small INTEGER DEFAULT 8;

-- Color settings
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR DEFAULT '75,0,130';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS secondary_color VARCHAR DEFAULT '245,245,245';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS text_color VARCHAR DEFAULT '0,0,0';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS header_bg_color VARCHAR DEFAULT '75,0,130';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS footer_bg_color VARCHAR DEFAULT '75,0,130';

-- Layout settings
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS header_height INTEGER DEFAULT 30;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS footer_height INTEGER DEFAULT 20;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS logo_width INTEGER DEFAULT 40;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS logo_height INTEGER DEFAULT 20;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS logo_position_x INTEGER DEFAULT 15;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS logo_position_y INTEGER DEFAULT 5;

-- Content positioning
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS booking_number_x INTEGER DEFAULT 160;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS booking_number_y INTEGER DEFAULT 15;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS title_y INTEGER DEFAULT 38;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS client_info_y INTEGER DEFAULT 60;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS booking_table_y INTEGER DEFAULT 105;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS price_section_y INTEGER DEFAULT 150;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS bank_details_y INTEGER DEFAULT 180;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS terms_y INTEGER DEFAULT 220;

-- Margins and spacing
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS page_margin_left INTEGER DEFAULT 15;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS page_margin_right INTEGER DEFAULT 15;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS section_spacing INTEGER DEFAULT 10;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS line_height INTEGER DEFAULT 6;

-- Show/hide sections
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT true;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS show_company_description BOOLEAN DEFAULT true;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS show_bank_details BOOLEAN DEFAULT true;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS show_terms BOOLEAN DEFAULT true;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS show_responsible_persons BOOLEAN DEFAULT true;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS show_footer_info BOOLEAN DEFAULT true;

-- Additional content
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS header_text_en VARCHAR DEFAULT 'CONFIRMATION';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS header_text_ar VARCHAR DEFAULT 'تأكيد';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS footer_company_name_en VARCHAR DEFAULT 'Ethraa Company for Tourist Accommodation';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS footer_company_name_ar VARCHAR DEFAULT 'شركة إثراء للإيواء السياحي';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS company_license VARCHAR DEFAULT '73105372';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS company_vat VARCHAR DEFAULT '302006094600003';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS company_cr VARCHAR DEFAULT '4031285856';