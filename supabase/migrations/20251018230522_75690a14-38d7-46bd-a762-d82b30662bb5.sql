-- Add SVG logo fields to pdf_settings table
ALTER TABLE pdf_settings 
ADD COLUMN IF NOT EXISTS header_logo_svg_en TEXT,
ADD COLUMN IF NOT EXISTS header_logo_svg_ar TEXT,
ADD COLUMN IF NOT EXISTS footer_logo_svg_en TEXT,
ADD COLUMN IF NOT EXISTS footer_logo_svg_ar TEXT;

-- Add helpful comment
COMMENT ON COLUMN pdf_settings.header_logo_svg_en IS 'SVG code for English header logo';
COMMENT ON COLUMN pdf_settings.header_logo_svg_ar IS 'SVG code for Arabic header logo';
COMMENT ON COLUMN pdf_settings.footer_logo_svg_en IS 'SVG code for English footer logo';
COMMENT ON COLUMN pdf_settings.footer_logo_svg_ar IS 'SVG code for Arabic footer logo';