
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'examiner', 'student');

-- 2. Create application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'adjusted');

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  school TEXT DEFAULT '',
  kcpe_index TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- 6. Results table
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  verified BOOLEAN NOT NULL DEFAULT false,
  examiner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id)
);
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- 7. Pathways table
CREATE TABLE public.pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  description TEXT DEFAULT '',
  careers JSONB DEFAULT '[]'::jsonb,
  progression JSONB DEFAULT '[]'::jsonb,
  focus_areas JSONB DEFAULT '[]'::jsonb,
  required_strengths JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;

-- 8. Pathway weights (admin-configurable subject weights per pathway)
CREATE TABLE public.pathway_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID REFERENCES public.pathways(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  weight_value NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (weight_value >= 0 AND weight_value <= 5),
  UNIQUE(pathway_id, subject_id)
);
ALTER TABLE public.pathway_weights ENABLE ROW LEVEL SECURITY;

-- 9. Cluster requirements
CREATE TABLE public.cluster_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID REFERENCES public.pathways(id) ON DELETE CASCADE NOT NULL UNIQUE,
  min_score NUMERIC(5,2) NOT NULL DEFAULT 50,
  required_subjects JSONB DEFAULT '[]'::jsonb
);
ALTER TABLE public.cluster_requirements ENABLE ROW LEVEL SECURITY;

-- 10. Interest questions
CREATE TABLE public.interest_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  pathway_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interest_questions ENABLE ROW LEVEL SECURITY;

-- 11. Interest responses
CREATE TABLE public.interest_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.interest_questions(id) ON DELETE CASCADE NOT NULL,
  answer_value INT NOT NULL CHECK (answer_value >= 1 AND answer_value <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, question_id)
);
ALTER TABLE public.interest_responses ENABLE ROW LEVEL SECURITY;

-- 12. Recommendations
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pathway_id UUID REFERENCES public.pathways(id) ON DELETE CASCADE NOT NULL,
  academic_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  interest_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
  explanation TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, pathway_id)
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- 13. Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chosen_pathway_id UUID REFERENCES public.pathways(id) ON DELETE CASCADE NOT NULL,
  recommended_pathway_id UUID REFERENCES public.pathways(id),
  status application_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 14. Security definer helper functions (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 15. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. RLS Policies

-- profiles
CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- subjects (readable by all authenticated)
CREATE POLICY "All can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update subjects" ON public.subjects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subjects" ON public.subjects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- results
CREATE POLICY "Students view own results" ON public.results FOR SELECT TO authenticated USING (
  auth.uid() = student_id OR public.has_role(auth.uid(), 'examiner') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Examiners insert results" ON public.results FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'examiner') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Examiners update results" ON public.results FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'examiner') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins delete results" ON public.results FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- pathways (readable by all)
CREATE POLICY "All can view pathways" ON public.pathways FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage pathways" ON public.pathways FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pathways" ON public.pathways FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete pathways" ON public.pathways FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- pathway_weights
CREATE POLICY "All can view pathway_weights" ON public.pathway_weights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage pathway_weights" ON public.pathway_weights FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pathway_weights" ON public.pathway_weights FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete pathway_weights" ON public.pathway_weights FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cluster_requirements
CREATE POLICY "All can view cluster_requirements" ON public.cluster_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage cluster_requirements" ON public.cluster_requirements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update cluster_requirements" ON public.cluster_requirements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete cluster_requirements" ON public.cluster_requirements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- interest_questions
CREATE POLICY "All can view interest_questions" ON public.interest_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage interest_questions" ON public.interest_questions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update interest_questions" ON public.interest_questions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete interest_questions" ON public.interest_questions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- interest_responses
CREATE POLICY "Students view own responses" ON public.interest_responses FOR SELECT TO authenticated USING (
  auth.uid() = student_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Students insert own responses" ON public.interest_responses FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = student_id AND public.has_role(auth.uid(), 'student')
);
CREATE POLICY "Students update own responses" ON public.interest_responses FOR UPDATE TO authenticated USING (
  auth.uid() = student_id AND public.has_role(auth.uid(), 'student')
);
CREATE POLICY "Admins delete responses" ON public.interest_responses FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- recommendations
CREATE POLICY "Students view own recommendations" ON public.recommendations FOR SELECT TO authenticated USING (
  auth.uid() = student_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'examiner')
);
CREATE POLICY "System inserts recommendations" ON public.recommendations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update recommendations" ON public.recommendations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete recommendations" ON public.recommendations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- applications
CREATE POLICY "Students view own applications" ON public.applications FOR SELECT TO authenticated USING (
  auth.uid() = student_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Students submit applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = student_id AND public.has_role(auth.uid(), 'student')
);
CREATE POLICY "Admins update applications" ON public.applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students can update pending applications" ON public.applications FOR UPDATE TO authenticated USING (
  auth.uid() = student_id AND status = 'pending'
);
CREATE POLICY "Admins delete applications" ON public.applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
