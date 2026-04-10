-- Habilitar a extensão para gerador de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Tabela: users
-- ==========================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  -- Dados bancários do seller para split
  mp_access_token TEXT,           -- token OAuth do seller no Mercado Pago
  mp_user_id      TEXT,           -- id do seller no Mercado Pago (para split)
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
CREATE TABLE public.media_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  media_type      TEXT NOT NULL CHECK (media_type IN ('tv','radio','outdoor','digital','influencer')),
  audience        JSONB,           -- { "size": 50000, "region": "SP", "age_range": "18-35" }
  metrics         JSONB,           -- { "cpm": 10.5, "avg_reach": 20000 }
  price           NUMERIC(12, 2) NOT NULL,
  cover_url       TEXT,            -- URL da imagem no R2
  media_urls      TEXT[],          -- vídeos/imagens adicionais no R2
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','sold')),
  is_approved     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.media_cards ENABLE ROW LEVEL SECURITY;

-- Público vê cards ativos e aprovados
CREATE POLICY "public_active" ON public.media_cards FOR SELECT TO authenticated
  USING (status = 'active' AND is_approved = TRUE);

-- Seller gerencia os próprios
CREATE POLICY "seller_own_cards" ON public.media_cards FOR ALL TO authenticated
  USING (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
  WITH CHECK (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Admin acesso total
CREATE POLICY "admin_all_cards" ON public.media_cards FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin');


-- ==========================================
-- 3. Tabela: transactions
-- ==========================================
CREATE TABLE public.transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID NOT NULL REFERENCES public.users(id),
  seller_id           UUID NOT NULL REFERENCES public.users(id),
  media_card_id       UUID NOT NULL REFERENCES public.media_cards(id),
  
  -- Valores
  total_amount        NUMERIC(12, 2) NOT NULL,
  platform_fee        NUMERIC(12, 2) NOT NULL,
  seller_amount       NUMERIC(12, 2) NOT NULL,
  
  -- Mercado Pago
  mp_payment_id       TEXT UNIQUE,
  mp_preference_id    TEXT,
  pix_qr_code         TEXT,
  pix_code            TEXT,
  pix_expires_at      TIMESTAMPTZ,
  
  -- Status
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','failed','refunded','in_dispute')),
  
  -- Flag TCCINE
  tccine_requested    BOOLEAN DEFAULT FALSE,
  tccine_status       TEXT DEFAULT 'not_applicable'
                      CHECK (tccine_status IN ('not_applicable','pending','in_production','delivered')),
  
  -- Campanha
  campaign_status     TEXT DEFAULT 'awaiting_payment'
                      CHECK (campaign_status IN ('awaiting_payment','awaiting_material','in_review','approved','running','finished')),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyer_own_transactions" ON public.transactions FOR SELECT TO authenticated
  USING (buyer_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "seller_own_transactions" ON public.transactions FOR SELECT TO authenticated
  USING (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "admin_all_transactions" ON public.transactions FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin');


-- ==========================================
-- 4. Tabela: campaign_materials
-- ==========================================
CREATE TABLE public.campaign_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  uploader_id     UUID NOT NULL REFERENCES public.users(id),
  file_url        TEXT NOT NULL,
  file_type       TEXT,
  approval_status TEXT DEFAULT 'pending'
                  CHECK (approval_status IN ('pending','approved','rejected')),
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar acesso a policies baseadas no envolvido da transação (reduzido para focar nas permissões)


-- ==========================================
-- 5. Tabela: messages (Chat)
-- ==========================================
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id),
  content         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_only" ON public.messages FOR ALL TO authenticated
  USING (
    transaction_id IN (
      SELECT id FROM public.transactions
      WHERE buyer_id  = (SELECT id FROM public.users WHERE auth_id = auth.uid())
         OR seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
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
