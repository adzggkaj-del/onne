
-- Create lending_plans table
CREATE TABLE public.lending_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_days INTEGER NOT NULL,
  interest_rate NUMERIC NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.lending_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can read lending plans"
  ON public.lending_plans FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can insert lending plans"
  ON public.lending_plans FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lending plans"
  ON public.lending_plans FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lending plans"
  ON public.lending_plans FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default plans
INSERT INTO public.lending_plans (term_days, interest_rate, label, sort_order) VALUES
  (7,  0.03, '7일 · 3%',  1),
  (15, 0.05, '15일 · 5%', 2),
  (30, 0.08, '30일 · 8%', 3),
  (60, 0.12, '60일 · 12%', 4);

-- Add tawk.to settings to platform_settings
INSERT INTO public.platform_settings (key, value, label, description) VALUES
  ('tawk_to_property_id', '', 'Tawk.to Property ID', 'Tawk.to 채팅 위젯의 Property ID'),
  ('tawk_to_widget_id', '', 'Tawk.to Widget ID', 'Tawk.to 채팅 위젯의 Widget ID');
