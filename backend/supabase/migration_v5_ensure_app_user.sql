-- Garante linha em public.users com SECURITY DEFINER (ignora RLS).
-- Útil se o backend usar a chave correta mas houver corrida e-mail único / trigger falho.
-- Rode no SQL Editor do Supabase (ou via CLI).

CREATE OR REPLACE FUNCTION public.ensure_app_user(
  p_auth_id uuid,
  p_email text,
  p_name text,
  p_avatar_url text
)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.users%ROWTYPE;
  em text;
  nm text;
  av text;
BEGIN
  SELECT * INTO r FROM public.users WHERE auth_id = p_auth_id LIMIT 1;
  IF FOUND THEN
    RETURN NEXT r;
    RETURN;
  END IF;

  em := NULLIF(trim(COALESCE(p_email, '')), '');
  IF em IS NULL THEN
    em := replace(p_auth_id::text, '-', '') || '@users.cotapubli.internal';
  END IF;

  nm := NULLIF(trim(COALESCE(p_name, '')), '');
  IF nm IS NULL THEN
    nm := 'Usuário';
  END IF;

  av := NULLIF(trim(COALESCE(p_avatar_url, '')), '');

  BEGIN
    INSERT INTO public.users (auth_id, email, name, role, avatar_url)
    VALUES (p_auth_id, em, nm, 'buyer', av)
    RETURNING * INTO r;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT * INTO r FROM public.users WHERE auth_id = p_auth_id LIMIT 1;
      IF FOUND THEN
        RETURN NEXT r;
        RETURN;
      END IF;
      INSERT INTO public.users (auth_id, email, name, role, avatar_url)
      VALUES (
        p_auth_id,
        replace(p_auth_id::text, '-', '') || '@users.cotapubli.internal',
        nm,
        'buyer',
        av
      )
      RETURNING * INTO r;
  END;

  RETURN NEXT r;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_app_user(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_app_user(uuid, text, text, text) TO service_role;
