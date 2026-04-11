import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

function resolveUserEmail(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata;
  const fromMeta = typeof meta?.email === 'string' ? meta.email.trim() : '';
  const direct = user.email?.trim() ?? '';
  if (direct) return direct;
  if (fromMeta) return fromMeta;
  // users.email é NOT NULL UNIQUE — placeholder estável por conta (ex.: login só telefone / OAuth sem e-mail)
  return `${user.id.replace(/-/g, '')}@users.cotapubli.internal`;
}

// Valida o JWT e anexa a linha de public.users em req.user (cria perfil se faltar).
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const email = resolveUserEmail(user);
  const displayName =
    (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '') ||
    (typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : '') ||
    email.split('@')[0] ||
    'Usuário';

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id, role, name, email, mp_user_id, is_certified, is_active')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[AuthMiddleware] users select error:', profileError);
    res.status(500).json({ error: 'Falha ao carregar perfil.', details: profileError.message });
    return;
  }

  if (!profile) {
    console.log(`[AuthMiddleware] Profile missing for ${user.id}, syncing...`);

    const avatarUrl =
      (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) || null;

    const { data: rpcRows, error: rpcError } = await supabaseAdmin.rpc('ensure_app_user', {
      p_auth_id: user.id,
      p_email: email,
      p_name: displayName,
      p_avatar_url: avatarUrl,
    });

    const fromRpc = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;

    if (fromRpc?.id) {
      (req as any).user = {
        id: fromRpc.id,
        role: fromRpc.role,
        name: fromRpc.name,
        email: fromRpc.email,
        mp_user_id: fromRpc.mp_user_id,
        is_certified: fromRpc.is_certified,
        is_active: fromRpc.is_active,
      };
      return next();
    }

    const rpcMissingFn =
      rpcError &&
      (rpcError.code === 'PGRST202' ||
        String(rpcError.message || '')
          .toLowerCase()
          .includes('could not find'));

    if (rpcError && !rpcMissingFn) {
      console.warn('[AuthMiddleware] ensure_app_user RPC:', rpcError.message);
    }

    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          auth_id: user.id,
          email,
          name: displayName,
          role: 'buyer',
          avatar_url: avatarUrl,
        },
        { onConflict: 'auth_id' }
      )
      .select('id, role, name, email, mp_user_id, is_certified, is_active')
      .single();

    if (insertError || !newProfile) {
      console.error('[AuthMiddleware] Failed to sync profile:', insertError ?? rpcError);
      res.status(503).json({
        error:
          'Não foi possível sincronizar o perfil com o banco. Confira SUPABASE_SERVICE_ROLE_KEY (deve ser a chave secreta / service_role, não a publishable) e se a tabela public.users existe.',
        details: insertError?.message ?? rpcError?.message,
      });
      return;
    }

    (req as any).user = newProfile;
  } else {
    (req as any).user = profile;
  }

  next();
}
