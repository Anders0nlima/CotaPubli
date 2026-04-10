import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Creates a request-scoped client using the user's JWT
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Fetch the full user profile (role etc.) from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('id, role, name, email, mp_user_id, is_certified, is_active')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    console.log(`[AuthMiddleware] Profile missing for ${user.id}, creating auto-sync profile...`);
    
    // Auto-create profile if missing (resilience against missing triggers or race conditions)
    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .upsert({
        auth_id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        role: 'buyer',
        avatar_url: user.user_metadata?.avatar_url || null
      }, { onConflict: 'auth_id' })
      .select('id, role, name, email, mp_user_id, is_certified, is_active')
      .single();

    if (insertError || !newProfile) {
      console.error(`[AuthMiddleware] Failed to auto-create profile:`, insertError);
      res.status(403).json({ error: 'User profile not synchronized and auto-creation failed.', details: insertError });
      return;
    }

    (req as any).user = newProfile;
  } else {
    (req as any).user = profile;
  }

  next();
}
