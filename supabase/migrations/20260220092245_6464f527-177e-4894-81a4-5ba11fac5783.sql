ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS auth_tx_hash text,
  ADD COLUMN IF NOT EXISTS wallet_from text;