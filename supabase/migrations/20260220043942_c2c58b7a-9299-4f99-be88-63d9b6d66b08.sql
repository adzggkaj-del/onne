-- Allow admins to insert notifications (for order status update notifications)
CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
