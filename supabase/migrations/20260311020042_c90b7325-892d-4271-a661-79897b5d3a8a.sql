ALTER TABLE public.orders ADD COLUMN term_days integer DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN repayment_date timestamp with time zone DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN usdt_balance numeric NOT NULL DEFAULT 300;