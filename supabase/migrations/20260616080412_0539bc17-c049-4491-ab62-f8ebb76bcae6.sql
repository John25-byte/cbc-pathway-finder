
-- 1. Profiles: restrict SELECT
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users view own profile; admins and examiners view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'examiner'::app_role)
);

-- 2. Move admin_notes off applications into admin-only table
CREATE TABLE IF NOT EXISTS public.application_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_admin_notes TO authenticated;
GRANT ALL ON public.application_admin_notes TO service_role;

ALTER TABLE public.application_admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage application admin notes"
ON public.application_admin_notes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_application_admin_notes_updated_at
BEFORE UPDATE ON public.application_admin_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing notes
INSERT INTO public.application_admin_notes (application_id, notes)
SELECT id, admin_notes
FROM public.applications
WHERE coalesce(admin_notes, '') <> ''
ON CONFLICT (application_id) DO NOTHING;

-- Drop the leaky column
ALTER TABLE public.applications DROP COLUMN IF EXISTS admin_notes;

-- 3. Lock down security-definer helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;

-- 4. Remove anon discoverability on sensitive tables
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE SELECT ON public.applications FROM anon;
REVOKE SELECT ON public.results FROM anon;
REVOKE SELECT ON public.recommendations FROM anon;
REVOKE SELECT ON public.interest_responses FROM anon;
