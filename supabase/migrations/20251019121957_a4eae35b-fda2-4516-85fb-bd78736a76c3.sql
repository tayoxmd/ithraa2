-- Add hotel confirmation number display settings to pdf_settings table
ALTER TABLE public.pdf_settings
ADD COLUMN hotel_confirmation_font_size INTEGER DEFAULT 12,
ADD COLUMN hotel_confirmation_font_family VARCHAR(50) DEFAULT 'helvetica',
ADD COLUMN hotel_confirmation_text_color VARCHAR(50) DEFAULT '75,0,130',
ADD COLUMN hotel_confirmation_border_color VARCHAR(50) DEFAULT '75,0,130',
ADD COLUMN hotel_confirmation_border_width NUMERIC DEFAULT 1,
ADD COLUMN hotel_confirmation_box_x INTEGER DEFAULT 15,
ADD COLUMN hotel_confirmation_box_y INTEGER DEFAULT 38,
ADD COLUMN hotel_confirmation_box_width INTEGER DEFAULT 180,
ADD COLUMN hotel_confirmation_box_height INTEGER DEFAULT 12,
ADD COLUMN hotel_confirmation_box_padding INTEGER DEFAULT 3,
ADD COLUMN hotel_confirmation_box_border_radius INTEGER DEFAULT 4;