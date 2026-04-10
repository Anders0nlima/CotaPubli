-- ==========================================
-- Migration V2: Conta Única com Perfilamento Progressivo
-- Aplicar sobre o banco existente
-- ==========================================

-- 1. Tornar role flexível com default 'buyer'
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'buyer';

-- 2. Adicionar campos de perfilamento progressivo
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ;

-- 3. Adicionar campos de wizard/localização na media_cards
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS wizard_step INT DEFAULT 0;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_lat NUMERIC(10, 7);
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_lng NUMERIC(10, 7);

-- 4. Atualizar constraint de status para incluir 'pending_approval'
ALTER TABLE public.media_cards DROP CONSTRAINT IF EXISTS media_cards_status_check;
ALTER TABLE public.media_cards ADD CONSTRAINT media_cards_status_check 
  CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'sold'));

-- 5. Atualizar RLS: permitir qualquer autenticado gerenciar seus cards
DROP POLICY IF EXISTS "seller_own_cards" ON public.media_cards;

CREATE POLICY "owner_own_cards" ON public.media_cards FOR ALL TO authenticated
  USING (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
  WITH CHECK (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- 6. Criar bucket de storage para fotos de anúncios (executar no Supabase Dashboard se necessário)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true)
-- ON CONFLICT (id) DO NOTHING;

-- 7. Policy de storage para listing-photos (executar no Supabase Dashboard)
-- CREATE POLICY "Authenticated users can upload listing photos"
-- ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'listing-photos');

-- CREATE POLICY "Anyone can view listing photos"  
-- ON storage.objects FOR SELECT TO public
-- USING (bucket_id = 'listing-photos');

-- CREATE POLICY "Users can delete own listing photos"
-- ON storage.objects FOR DELETE TO authenticated
-- USING (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
