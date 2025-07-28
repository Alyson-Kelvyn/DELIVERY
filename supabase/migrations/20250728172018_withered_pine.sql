/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_data` (jsonb, customer information)
      - `items` (jsonb, order items array)
      - `total` (numeric, order total)
      - `status` (text, order status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for authenticated user access
*/

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_data jsonb NOT NULL,
  items jsonb NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'entregue')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated');