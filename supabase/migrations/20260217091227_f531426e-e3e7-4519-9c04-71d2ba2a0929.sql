
-- 1. Role system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- user_roles RLS: only admins can read/write
CREATE POLICY "Admins can select all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can check their own role
CREATE POLICY "Users can read own role"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. Platform settings table
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
ON public.platform_settings FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can update settings"
ON public.platform_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed default settings
INSERT INTO public.platform_settings (key, value, label, description) VALUES
  ('buy_spread', '0.99', '구매 스프레드', '구매 시 시장가 대비 할인 계수 (예: 0.99 = 1% 할인)'),
  ('sell_spread', '1.01', '판매 스프레드', '판매 시 시장가 대비 프리미엄 계수 (예: 1.01 = 1% 프리미엄)'),
  ('trade_fee_rate', '0.001', '거래 수수료율', '거래 시 부과되는 수수료 비율 (예: 0.001 = 0.1%)'),
  ('lending_daily_rate', '0.001', '대출 일일 이자율', '대출 일일 이자율 (예: 0.001 = 0.1%)'),
  ('lending_term_days', '30', '대출 기간(일)', '기본 대출 기간 일수'),
  ('krw_rate', '1380', 'USD/KRW 환율', 'USD 대비 KRW 환율');

-- Trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Extend existing table RLS for admin access

-- supported_coins: admin CRUD
CREATE POLICY "Admins can insert coins"
ON public.supported_coins FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coins"
ON public.supported_coins FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coins"
ON public.supported_coins FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- profiles: admin can see all
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- orders: admin can see and update all
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
