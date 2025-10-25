-- إضافة سياسات RLS للجداول الحرجة المتعلقة بالصيانة والإدارة

-- 1. جدول maintenance_state - حالة الصيانة
CREATE POLICY "المدراء يمكنهم قراءة حالة الصيانة"
  ON maintenance_state
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم تحديث حالة الصيانة"
  ON maintenance_state
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إضافة حالة صيانة"
  ON maintenance_state
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 2. جدول deploy_snapshots - نسخ النشر
CREATE POLICY "المدراء يمكنهم قراءة نسخ النشر"
  ON deploy_snapshots
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إضافة نسخ نشر"
  ON deploy_snapshots
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 3. جدول maintenance_actions - سجل إجراءات الصيانة
CREATE POLICY "المدراء يمكنهم قراءة سجل الصيانة"
  ON maintenance_actions
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إضافة إجراءات صيانة"
  ON maintenance_actions
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 4. جدول admin_actions - سجل إجراءات المدراء
CREATE POLICY "المدراء يمكنهم قراءة سجل الإجراءات"
  ON admin_actions
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إضافة إجراءات"
  ON admin_actions
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 5. جدول theme_versions - إصدارات الثيمات
CREATE POLICY "الجميع يمكنهم قراءة الثيمات النشطة"
  ON theme_versions
  FOR SELECT
  USING (
    is_active = true OR public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إدارة الثيمات"
  ON theme_versions
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 6. جدول indicator_assets - أصول مؤشرات التحميل
CREATE POLICY "الجميع يمكنهم قراءة المؤشرات النشطة"
  ON indicator_assets
  FOR SELECT
  USING (
    is_active = true OR public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إدارة المؤشرات"
  ON indicator_assets
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 7. جدول cache_audit - سجل التخزين المؤقت
CREATE POLICY "المدراء يمكنهم قراءة سجل التخزين المؤقت"
  ON cache_audit
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إضافة سجلات التخزين المؤقت"
  ON cache_audit
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 8. جدول upload_audit - سجل الرفع
CREATE POLICY "المدراء يمكنهم قراءة سجل الرفع"
  ON upload_audit
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إضافة سجلات رفع"
  ON upload_audit
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 9. جدول asset_hotfixes - إصلاحات الأصول
CREATE POLICY "المدراء يمكنهم قراءة إصلاحات الأصول"
  ON asset_hotfixes
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "المدراء يمكنهم إدارة إصلاحات الأصول"
  ON asset_hotfixes
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- إضافة تعليقات توضيحية
COMMENT ON POLICY "المدراء يمكنهم قراءة حالة الصيانة" ON maintenance_state IS 
  'يسمح للمدراء فقط بقراءة حالة الصيانة';

COMMENT ON POLICY "المدراء يمكنهم قراءة سجل الإجراءات" ON admin_actions IS 
  'يسمح للمدراء فقط بقراءة سجل جميع الإجراءات الإدارية للتدقيق';

COMMENT ON POLICY "الجميع يمكنهم قراءة الثيمات النشطة" ON theme_versions IS 
  'يسمح للجميع بقراءة الثيمات النشطة، والمدراء يمكنهم رؤية جميع الثيمات';

COMMENT ON POLICY "الجميع يمكنهم قراءة المؤشرات النشطة" ON indicator_assets IS 
  'يسمح للجميع بقراءة مؤشرات التحميل النشطة لعرض واجهة المستخدم';