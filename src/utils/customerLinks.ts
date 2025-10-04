import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a permanent link for customer's bookings page
 * The link includes the user ID as a parameter
 */
export function generateCustomerPageUrl(userId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/customer-dashboard?uid=${userId}`;
}

/**
 * Validate if a user can access the customer dashboard
 * Returns true if the current user matches the requested user ID
 */
export async function validateCustomerAccess(requestedUserId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  // User can access their own dashboard
  if (user.id === requestedUserId) return true;
  
  // Check if current user is admin or employee
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  
  if (roles && roles.length > 0) {
    const userRole = roles[0].role;
    return userRole === 'admin' || userRole === 'employee';
  }
  
  return false;
}
