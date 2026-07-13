
-- Inquiries and threaded messages between students and staff (admin/examiner)
CREATE TABLE public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_role public.app_role NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own inquiries"
  ON public.inquiries FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Recipient role can view inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), recipient_role));

CREATE POLICY "Recipient role can update inquiries"
  ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), recipient_role));

CREATE TRIGGER trg_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.inquiry_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_messages TO authenticated;
GRANT ALL ON public.inquiry_messages TO service_role;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student or recipient role can read messages"
  ON public.inquiry_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inquiries i
      WHERE i.id = inquiry_id
        AND (i.student_id = auth.uid() OR public.has_role(auth.uid(), i.recipient_role))
    )
  );

CREATE POLICY "Student or recipient role can insert messages"
  ON public.inquiry_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.inquiries i
      WHERE i.id = inquiry_id
        AND (i.student_id = auth.uid() OR public.has_role(auth.uid(), i.recipient_role))
    )
  );
