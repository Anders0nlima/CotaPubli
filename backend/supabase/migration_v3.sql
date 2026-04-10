-- ==========================================
-- Migration V3 - Novo fluxo onboarding
-- ==========================================

-- 1. Adicionada a coluna birth_date para perfilamento obrigatório.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date DATE;
