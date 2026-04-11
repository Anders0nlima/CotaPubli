import dotenv from 'dotenv';
import path from 'path';

// override: true — o .env do projeto prevalece sobre variáveis já definidas no SO/terminal
// (evita SUPABASE_SERVICE_ROLE_KEY antiga tipo anon JWT ignorar o sb_secret_ do .env)
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
