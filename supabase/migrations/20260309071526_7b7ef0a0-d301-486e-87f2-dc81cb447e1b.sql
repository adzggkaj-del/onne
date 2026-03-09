ALTER TABLE public.supported_coins ADD COLUMN buy_spread numeric DEFAULT NULL;
ALTER TABLE public.supported_coins ADD COLUMN sell_spread numeric DEFAULT NULL;
ALTER TABLE public.supported_coins ADD COLUMN lending_spread numeric DEFAULT NULL;