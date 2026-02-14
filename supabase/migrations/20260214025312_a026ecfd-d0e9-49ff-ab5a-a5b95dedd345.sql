
-- 1. supported_coins table
CREATE TABLE public.supported_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coin_id TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL,
  name_kr TEXT NOT NULL,
  chain TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '●',
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supported_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read supported coins"
  ON public.supported_coins FOR SELECT
  USING (true);

-- Insert current 8 coins
INSERT INTO public.supported_coins (coin_id, symbol, name_kr, chain, icon, sort_order) VALUES
  ('bitcoin', 'BTC', '비트코인', 'ethereum', '₿', 1),
  ('ethereum', 'ETH', '이더리움', 'ethereum', '⟠', 2),
  ('binancecoin', 'BNB', '비앤비', 'bsc', '◆', 3),
  ('solana', 'SOL', '솔라나', 'solana', '◎', 4),
  ('ripple', 'XRP', '리플', 'ethereum', '✕', 5),
  ('tron', 'TRX', '트론', 'tron', '◈', 6),
  ('matic-network', 'MATIC', '폴리곤', 'polygon', '⬡', 7),
  ('tether', 'USDT', '테더', 'ethereum', '₮', 8);

-- 2. notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order',
  read BOOLEAN NOT NULL DEFAULT false,
  related_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. Trigger: auto-create notification when order is inserted
CREATE OR REPLACE FUNCTION public.notify_on_order_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  type_label TEXT;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  CASE NEW.type
    WHEN 'buy' THEN type_label := '구매';
    WHEN 'sell' THEN type_label := '판매';
    WHEN 'lending' THEN type_label := '대출';
    ELSE type_label := NEW.type;
  END CASE;

  notif_title := type_label || ' 주문이 접수되었습니다';
  notif_message := NEW.coin_symbol || ' ' || NEW.amount || '개 · ' || TO_CHAR(NEW.total_krw, 'FM999,999,999,999') || '원';

  INSERT INTO public.notifications (user_id, title, message, type, related_order_id)
  VALUES (NEW.user_id, notif_title, notif_message, 'order', NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_order_created();
