-- Securely expose hotel listings via RPC functions while keeping the hotels table protected
-- Revoke broad PUBLIC execution and grant explicit execution to anon and authenticated

-- Revoke existing PUBLIC privileges (if any)
REVOKE ALL ON FUNCTION public.get_public_hotels(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_hotel(uuid) FROM PUBLIC;

-- Grant execute on the safe, filtered functions to web roles
GRANT EXECUTE ON FUNCTION public.get_public_hotels(uuid, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_hotel(uuid) TO anon, authenticated;