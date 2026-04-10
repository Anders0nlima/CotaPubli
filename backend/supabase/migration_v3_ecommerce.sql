-- ==========================================
-- Migration V3: E-commerce e Gestão de Carrinho (Soft Delete e Split Payments)
-- Aplicar sobre o banco existente
-- ==========================================

-- 1. Soft Delete para mídias
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Atualizar Políticas de RLS de media_cards para contemplar o Soft Delete
DROP POLICY IF EXISTS "public_active" ON public.media_cards;
CREATE POLICY "public_active" ON public.media_cards FOR SELECT TO authenticated
  USING (status = 'active' AND is_approved = TRUE AND deleted_at IS NULL);

-- 3. Tabela: orders (Pedido Geral do Carrinho)
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID NOT NULL REFERENCES public.users(id),
  
  total_amount        NUMERIC(12, 2) NOT NULL,
  
  payment_method      TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  mp_payment_id       TEXT UNIQUE,
  mp_preference_id    TEXT,
  pix_qr_code         TEXT,
  pix_code            TEXT,
  pix_expires_at      TIMESTAMPTZ,
  
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','failed','refunded','in_dispute')),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buyer_own_orders" ON public.orders;
CREATE POLICY "buyer_own_orders" ON public.orders FOR SELECT TO authenticated
  USING (buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "admin_all_orders" ON public.orders;
CREATE POLICY "admin_all_orders" ON public.orders FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin');

-- 4. Tabela: order_items (Itens do Pedido / Split)
CREATE TABLE IF NOT EXISTS public.order_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  media_card_id       UUID NOT NULL REFERENCES public.media_cards(id),
  seller_id           UUID NOT NULL REFERENCES public.users(id),
  
  quantity            INT NOT NULL DEFAULT 1,
  unit_price          NUMERIC(12, 2) NOT NULL,
  platform_fee        NUMERIC(12, 2) NOT NULL,
  seller_amount       NUMERIC(12, 2) NOT NULL,
  
  tccine_requested    BOOLEAN DEFAULT FALSE,
  tccine_status       TEXT DEFAULT 'not_applicable'
                      CHECK (tccine_status IN ('not_applicable','pending','in_production','delivered')),
  
  campaign_status     TEXT DEFAULT 'awaiting_payment'
                      CHECK (campaign_status IN ('awaiting_payment','awaiting_material','in_review','approved','running','finished')),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buyer_own_items" ON public.order_items;
CREATE POLICY "buyer_own_items" ON public.order_items FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())));

DROP POLICY IF EXISTS "seller_own_items" ON public.order_items;
CREATE POLICY "seller_own_items" ON public.order_items FOR SELECT TO authenticated
  USING (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "admin_all_items" ON public.order_items;
CREATE POLICY "admin_all_items" ON public.order_items FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin');

-- 5. Atualizar tabelas antigas (substituir transaction_id por order_item_id)
-- Caso as tabelas existam e possuam a coluna transaction_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_materials' AND column_name = 'transaction_id') THEN
     ALTER TABLE public.campaign_materials DROP COLUMN transaction_id CASCADE;
     ALTER TABLE public.campaign_materials ADD COLUMN order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'transaction_id') THEN
     ALTER TABLE public.messages DROP COLUMN transaction_id CASCADE;
     ALTER TABLE public.messages ADD COLUMN order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE;
     
     -- Drop old policy
     DROP POLICY IF EXISTS "participants_only" ON public.messages;
     
     -- New policy for messages based on order_items
     CREATE POLICY "participants_only" ON public.messages FOR ALL TO authenticated
       USING (
         order_item_id IN (
           SELECT id FROM public.order_items
           WHERE seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
              OR order_id IN (SELECT id FROM public.orders WHERE buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
         )
       );
  END IF;
END $$;
