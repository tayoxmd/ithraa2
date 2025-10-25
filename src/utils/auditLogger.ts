import { supabase } from "@/integrations/supabase/client";

/**
 * Log an audit event to the audit_logs table
 */
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId?: string,
  details?: any
) {
  try {
    const { error } = await supabase.rpc('log_audit_event', {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId || null,
      p_details: details || null
    });

    if (error) {
      // Silently log error without throwing - audit logging is non-critical
      console.warn('Audit logging failed (non-critical):', error.message);
    }
  } catch (error: any) {
    // Silently catch errors - audit logging should not break the application
    console.warn('Audit logging failed (non-critical):', error?.message || error);
  }
}

/**
 * Log an admin action to the admin_actions table
 */
export async function logAdminAction(
  userId: string,
  actionType: string,
  entityType: string,
  details?: any
) {
  try {
    const { error } = await supabase
      .from('admin_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        entity_type: entityType,
        details: details || null
      });

    if (error) {
      console.warn('Admin action logging failed (non-critical):', error.message);
    }
  } catch (error: any) {
    console.warn('Admin action logging failed (non-critical):', error?.message || error);
  }
}

/**
 * Log a cache operation to cache_audit table
 */
export async function logCacheOperation(
  action: string,
  cacheKeys: string[],
  status: string,
  userId?: string,
  details?: any
) {
  try {
    const { error } = await supabase
      .from('cache_audit')
      .insert({
        action,
        cache_keys: cacheKeys,
        purge_status: status,
        initiated_by: userId || null,
        details: details || null
      });

    if (error) {
      console.warn('Cache audit logging failed (non-critical):', error.message);
    }
  } catch (error: any) {
    console.warn('Cache audit logging failed (non-critical):', error?.message || error);
  }
}

/**
 * Log a file upload to upload_audit table
 */
export async function logUploadOperation(
  userId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  uploadTarget: string,
  status: 'success' | 'failed',
  errorMessage?: string
) {
  try {
    const { error } = await supabase
      .from('upload_audit')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        upload_target: uploadTarget,
        status,
        error_message: errorMessage || null
      });

    if (error) {
      console.warn('Upload audit logging failed (non-critical):', error.message);
    }
  } catch (error: any) {
    console.warn('Upload audit logging failed (non-critical):', error?.message || error);
  }
}
