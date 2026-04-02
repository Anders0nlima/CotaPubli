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
    res.status(403).json({ error: 'User profile not found' });
    return;
  }

  (req as any).user = profile;
  next();
}
