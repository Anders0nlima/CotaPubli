/**
 * Garante que SUPABASE_SERVICE_ROLE_KEY não seja a chave pública (anon/publishable).
 * Com a chave errada, o PostgREST aplica RLS e inserts em public.users falham → 403 nas rotas /api/listings.
 */
export function assertServiceRoleKey(key: string): void {
  const k = key.trim();
  if (!k) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is empty.');
  }

  if (k.startsWith('sb_publishable_')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY está com a chave publishable (pública). ' +
        'Use a chave secreta do projeto: Supabase → Project Settings → API → "Secret key" (sb_secret_...) ' +
        'ou a legacy "service_role" JWT (eyJ...). Nunca use anon nem publishable no backend.'
    );
  }

  if (k.startsWith('sb_secret_')) {
    return;
  }

  const parts = k.split('.');
  if (parts.length >= 2 && k.startsWith('eyJ')) {
    try {
      const b = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = b.length % 4 === 0 ? '' : '='.repeat(4 - (b.length % 4));
      const json = Buffer.from(b + pad, 'base64').toString('utf8');
      const payload = JSON.parse(json) as { role?: string };
      if (payload.role === 'service_role') {
        return;
      }
      if (payload.role === 'anon') {
        throw new Error(
          'SUPABASE_SERVICE_ROLE_KEY está com a chave ANON (pública): o JWT tem "role":"anon". ' +
            'Essa costuma ser a mesma do frontend (NEXT_PUBLIC_SUPABASE_ANON_KEY) — não serve no backend. ' +
            'No Supabase: Settings → API. Se aparecer "Legacy anon / service_role": copie só a linha service_role (Reveal). ' +
            'Se aparecer "Publishable + Secret": copie a Secret (sb_secret_...), nunca a Publishable.'
        );
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        throw e;
      }
      // JWT malformado: deixa o cliente Supabase falhar com mensagem própria
    }
    return;
  }

  // Outros formatos legados / futuros: não bloquear
}
