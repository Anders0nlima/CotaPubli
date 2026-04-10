-- Habilitar a extensão para gerador de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Tabela: users
-- ==========================================
-- Modelo "Conta Única": todo usuário começa como 'buyer'.
-- A role muda para 'seller' automaticamente quando publica um anúncio.
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  phone         TEXT,
  birth_date    DATE,
  document      TEXT,                     -- CPF/CNPJ — coletado apenas no momento de publicar
  accepted_terms_at TIMESTAMPTZ,          -- Quando aceitou os termos de uso
  -- Dados bancários do seller para split
  mp_access_token TEXT,                   -- token OAuth do seller no Mercado Pago
  mp_user_id      TEXT,                   -- id do seller no Mercado Pago (para split)
  is_certified    BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Usuário vê e edita apenas o próprio perfil
CREATE POLICY "users_self" ON public.users FOR ALL TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Admin vê e edita todos
CREATE POLICY "admin_all_users" ON public.users FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin'
  );


-- ==========================================
-- 2. Tabela: media_cards
-- ==========================================
-- Suporta drafts do wizard multi-step e localização detalhada
CREATE TABLE public.media_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT,
  description     TEXT,
  media_type      TEXT CHECK (media_type IN ('tv','radio','outdoor','digital','influencer')),
  audience        JSONB,           -- { "size": 50000, "region": "SP", "age_range": "18-35" }
  metrics         JSONB,           -- { "cpm": 10.5, "avg_reach": 20000 }
  price           NUMERIC(12, 2),
  cover_url       TEXT,            -- URL da imagem no Storage
  media_urls      TEXT[],          -- fotos adicionais
  -- Campos de localização (wizard)
  location_address TEXT,
  location_city    TEXT,
  location_state   TEXT,
  location_lat     NUMERIC(10, 7),
  location_lng     NUMERIC(10, 7),
  -- Wizard tracking
  wizard_step      INT DEFAULT 0,
  -- Status
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','active','paused','sold')),
  is_approved     BOOLEAN DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.media_cards ENABLE ROW LEVEL SECURITY;

-- Público vê cards ativos e aprovados e não deletados
CREATE POLICY "public_active" ON public.media_cards FOR SELECT TO authenticated
  USING (status = 'active' AND is_approved = TRUE AND deleted_at IS NULL);

-- Qualquer autenticado gerencia seus próprios cards (conta única)
CREATE POLICY "owner_own_cards" ON public.media_cards FOR ALL TO authenticated
  USING (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
  WITH CHECK (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Admin acesso total
CREATE POLICY "admin_all_cards" ON public.media_cards FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin');


-- ==========================================
-- 3. Tabela: orders (Pedido Geral do Carrinho)
-- ==========================================
CREATE TABLE public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID NOT NULL REFERENCES public.users(id),
  
  -- Valores Totais do Carrinho
  total_amount        NUMERIC(12, 2) NOT NULL,
  
  -- Pagamento (Mock/MercadoPago futuro)
  payment_method      TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  mp_payment_id       TEXT UNIQUE,
  mp_preference_id    TEXT,
  pix_qr_code         TEXT,
  pix_code            TEXT,
  pix_expires_at      TIMESTAMPTZ,
  
  -- Status Geral do Pedido
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','failed','refunded','in_dispute')),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyer_own_orders" ON public.orders FOR SELECT TO authenticated
  USING (buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "admin_all_orders" ON public.orders FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin');

-- ==========================================
-- 3.1. Tabela: order_items (Itens do Pedido / Split)
-- ==========================================
-- Como o carrinho pode ter múltiplos vendedores, o tracking de negócio acontece aqui.
CREATE TABLE public.order_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  media_card_id       UUID NOT NULL REFERENCES public.media_cards(id),
  seller_id           UUID NOT NULL REFERENCES public.users(id),
  
  -- Snapshot de Valores Históricos do Item
  quantity            INT NOT NULL DEFAULT 1,
  unit_price          NUMERIC(12, 2) NOT NULL,
  platform_fee        NUMERIC(12, 2) NOT NULL,
  seller_amount       NUMERIC(12, 2) NOT NULL,
  
  -- Flag TCCINE
  tccine_requested    BOOLEAN DEFAULT FALSE,
  tccine_status       TEXT DEFAULT 'not_applicable'
                      CHECK (tccine_status IN ('not_applicable','pending','in_production','delivered')),
  
  -- Campanha individual por item (já que Mídia A pode aprovar antes da Mídia B)
  campaign_status     TEXT DEFAULT 'awaiting_payment'
                      CHECK (campaign_status IN ('awaiting_payment','awaiting_material','in_review','approved','running','finished')),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyer_own_items" ON public.order_items FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())));

CREATE POLICY "seller_own_items" ON public.order_items FOR SELECT TO authenticated
  USING (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "admin_all_items" ON public.order_items FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin');


-- ==========================================
-- 4. Tabela: campaign_materials
-- ==========================================
CREATE TABLE public.campaign_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  uploader_id     UUID NOT NULL REFERENCES public.users(id),
  file_url        TEXT NOT NULL,
  file_type       TEXT,
  approval_status TEXT DEFAULT 'pending'
                  CHECK (approval_status IN ('pending','approved','rejected')),
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 5. Tabela: messages (Chat de Negociação)
-- ==========================================
-- Chat ocorre no escopo de um item específico entre Comprador e Vendedor.
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id),
  content         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_only" ON public.messages FOR ALL TO authenticated
  USING (
    order_item_id IN (
      SELECT id FROM public.order_items
      WHERE seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
         OR order_id IN (SELECT id FROM public.orders WHERE buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
    )
  );


-- ==========================================
-- 6. Tabela: commission_settings (Admin)
-- ==========================================
CREATE TABLE public.commission_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type      TEXT,
  fee_percentage  NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  updated_by      UUID REFERENCES public.users(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir valor padrao default global
INSERT INTO public.commission_settings (media_type, fee_percentage) VALUES (NULL, 10.00);


-- ==========================================
-- 7. Trigger (Auth para users)
-- ==========================================
-- Quando o registro acontece no auth.users do Supabase, nós sincronizamos para a nossa tabela 'users'.
-- Criando essa função, garantimos que a nossa tabela de users é populada:
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Observação: no nosso AuthContext do React nós registramos, e então fazemos a inserção na 'users' via API.
  -- Usar trigger é uma alternativa. Se for criar um usuário manualmente, descomente abaixo ou gerencie via app.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
