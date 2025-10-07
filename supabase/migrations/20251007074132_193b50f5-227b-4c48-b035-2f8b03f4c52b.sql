-- Fix search path for create_system_backup function
ALTER FUNCTION create_system_backup() SET search_path = public;