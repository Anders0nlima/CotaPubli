-- ==========================================
-- Migration V4: Sincronização Autônoma de Usuários via Trigger
-- Aplicar sobre o banco existente
-- ==========================================

-- 1. Cria ou substitui a função de inserção automática de usuários pós Cadastro (Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'buyer',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Vincula o Trigger à tabela `auth.users` do Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Cria índice na tabela de mídias para acelerar a busca de Rascunhos do Vendedor
CREATE INDEX IF NOT EXISTS idx_media_cards_seller_status 
ON public.media_cards (seller_id, status);

-- 4. CONFIGURAÇÃO DE STORAGE (FOTOS)
-- Criar bucket 'listing-photos' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Permitir que qualquer pessoa veja as fotos (Público)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listing-photos' );

-- Política: Permitir que usuários autenticados enviem fotos
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'listing-photos' );

-- Política: Permitir que usuários excluam apenas suas próprias fotos
-- (Considerando o caminho: seller_id/nomedearquivo.ext)
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text );
