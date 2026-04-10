import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || URL.parse(supabaseUrl)?.hostname === 'your-project.supabase.co') {
  console.log("Variáveis de ambiente ainda estão com valores padrão ou não foram carregadas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log(`Conectando em ${supabaseUrl}...`);
  // Try querying a table, e.g., 'users'
  const { data, error } = await supabase.from('users').select('id').limit(1);
  
  if (error) {
    console.error("Erro ao conectar ou consultar:", error.message);
    if (error.code === '42P01') {
      console.log("Aviso: A tabela 'users' não existe. Isso significa que as tabelas ainda não foram criadas no banco.");
    }
  } else {
    console.log("Conexão bem sucedida. Banco de dados acessível.");
  }
}

testConnection();
