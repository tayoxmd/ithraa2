-- Fix RLS Enabled No Policy issue
-- Add appropriate RLS policies for 7 tables that have RLS enabled but no policies

-- 1. api_requests: Only admins and managers can view API request logs
CREATE POLICY "Admins can view API requests"
ON public.api_requests
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "System can insert API requests"
ON public.api_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. booking_actions_log: Staff can view booking action logs for auditing
CREATE POLICY "Staff can view booking actions"
ON public.booking_actions_log
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'employee'::app_role]));

CREATE POLICY "System can insert booking actions"
ON public.booking_actions_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. chat_messages: Users can view messages in their sessions, staff can view all
CREATE POLICY "Users can view their session messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'employee'::app_role]));

CREATE POLICY "Users can insert messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Staff can insert messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'employee'::app_role]));

-- 4. hotel_responsible_persons: Staff can manage, employees can view their assignments
CREATE POLICY "Staff can manage responsible persons"
ON public.hotel_responsible_persons
FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Employees can view their assignments"
ON public.hotel_responsible_persons
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

-- 5. room_availability: Public can view for availability checks, system manages it
CREATE POLICY "Anyone can view room availability"
ON public.room_availability
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "System can manage room availability"
ON public.room_availability
FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- 6. site_settings: Public can view settings, admins can manage
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. whatsapp_settings: Only admins can view and manage
CREATE POLICY "Admins can view whatsapp settings"
ON public.whatsapp_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage whatsapp settings"
ON public.whatsapp_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));