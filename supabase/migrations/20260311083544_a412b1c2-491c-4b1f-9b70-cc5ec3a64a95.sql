ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_type_check CHECK (type = ANY (ARRAY['buy', 'sell', 'lending', 'withdraw']));