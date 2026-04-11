import '../loadEnv';
import { createClient } from '@supabase/supabase-js';
import { assertServiceRoleKey } from './validateSupabaseKey';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

assertServiceRoleKey(serviceKey);

// Cliente admin — com service_role / sb_secret_ ignora RLS nas operações de servidor
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
