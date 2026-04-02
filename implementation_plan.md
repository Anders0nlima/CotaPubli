# Cotapubli MVP — Plano de Arquitetura

Plataforma de intermediação para compra e venda de cotas publicitárias (mídia tradicional, digital e influenciadores), com pagamento via PIX e split automático via Mercado Pago.

---

## 1. Modelagem de Dados (Supabase / PostgreSQL)

### Diagrama de Relacionamentos

```
users ──< media_cards ──< transactions ──< messages
  │                            │
  └──────────────────────< campaign_materials
```

---

### Tabela: `users`

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  -- Dados bancários do seller para split
  mp_access_token TEXT,           -- token OAuth do seller no Mercado Pago
  mp_user_id      TEXT,           -- id do seller no Mercado Pago (para split)
  is_certified    BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Usuário vê e edita apenas o próprio perfil
CREATE POLICY "users_self" ON users
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());
-- Admin vê todos
CREATE POLICY "admin_all" ON users
  TO authenticated USING (
    (SELECT role FROM users WHERE auth_id = auth.uid()) = 'admin'
  );
```

---

### Tabela: `media_cards`

```sql
CREATE TABLE media_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  media_type      TEXT NOT NULL CHECK (media_type IN ('tv','radio','outdoor','digital','influencer')),
  audience        JSONB,           -- { "size": 50000, "region": "SP", "age_range": "18-35" }
  metrics         JSONB,           -- { "cpm": 10.5, "avg_reach": 20000 }
  price           NUMERIC(12, 2) NOT NULL,
  cover_url       TEXT,            -- URL da imagem no R2
  media_urls      TEXT[],          -- vídeos/imagens adicionais no R2
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','sold')),
  is_approved     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:**
```sql
ALTER TABLE media_cards ENABLE ROW LEVEL SECURITY;
-- Público vê cards ativos e aprovados
CREATE POLICY "public_active" ON media_cards FOR SELECT
  USING (status = 'active' AND is_approved = TRUE);
-- Seller gerencia os próprios
CREATE POLICY "seller_own" ON media_cards
  USING (seller_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (seller_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
-- Admin acesso total
CREATE POLICY "admin_all" ON media_cards
  USING ((SELECT role FROM users WHERE auth_id = auth.uid()) = 'admin');
```

---

### Tabela: `transactions`

Coração do split de pagamento e flag TCCINE.

```sql
CREATE TABLE transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID NOT NULL REFERENCES users(id),
  seller_id           UUID NOT NULL REFERENCES users(id),
  media_card_id       UUID NOT NULL REFERENCES media_cards(id),
  
  -- Valores
  total_amount        NUMERIC(12, 2) NOT NULL,    -- valor cobrado do comprador
  platform_fee        NUMERIC(12, 2) NOT NULL,    -- comissão da plataforma
  seller_amount       NUMERIC(12, 2) NOT NULL,    -- total_amount - platform_fee
  
  -- Mercado Pago
  mp_payment_id       TEXT UNIQUE,                -- id retornado pelo MP
  mp_preference_id    TEXT,                       -- id da preferência/PIX
  pix_qr_code         TEXT,                       -- base64 do QR Code
  pix_code            TEXT,                       -- código copia-e-cola
  pix_expires_at      TIMESTAMPTZ,
  
  -- Status
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','failed','refunded','in_dispute')),
  
  -- Flag TCCINE
  tccine_requested    BOOLEAN DEFAULT FALSE,      -- comprador quer produção
  tccine_status       TEXT DEFAULT 'not_applicable'
                      CHECK (tccine_status IN ('not_applicable','pending','in_production','delivered')),
  
  -- Campanha
  campaign_status     TEXT DEFAULT 'awaiting_payment'
                      CHECK (campaign_status IN ('awaiting_payment','awaiting_material','in_review','approved','running','finished')),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:**
```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyer_own" ON transactions FOR SELECT
  USING (buyer_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "seller_own" ON transactions FOR SELECT
  USING (seller_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "admin_all" ON transactions
  USING ((SELECT role FROM users WHERE auth_id = auth.uid()) = 'admin');
```

---

### Tabela: `campaign_materials`

```sql
CREATE TABLE campaign_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  uploader_id     UUID NOT NULL REFERENCES users(id),
  file_url        TEXT NOT NULL,          -- URL do arquivo no R2
  file_type       TEXT,                   -- 'image' | 'video' | 'document'
  approval_status TEXT DEFAULT 'pending'
                  CHECK (approval_status IN ('pending','approved','rejected')),
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Tabela: `messages` (Chat Supabase Realtime)

```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  content         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:**
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants_only" ON messages
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id  = (SELECT id FROM users WHERE auth_id = auth.uid())
         OR seller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );
```

---

### Tabela: `commission_settings` (Admin)

```sql
CREATE TABLE commission_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type      TEXT,           -- NULL = default global
  fee_percentage  NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  updated_by      UUID REFERENCES users(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Arquitetura do Backend (Node.js + TypeScript)

### Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   ├── supabase.ts       # Supabase Admin Client
│   │   ├── mercadopago.ts    # MP SDK config
│   │   └── r2.ts             # AWS S3 SDK apontando para R2
│   ├── middlewares/
│   │   ├── auth.ts           # Valida JWT do Supabase
│   │   └── rbac.ts           # Middleware de role (buyer/seller/admin)
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── cards.routes.ts
│   │   ├── transactions.routes.ts  ← FOCO: PIX + Split
│   │   ├── webhook.routes.ts       ← FOCO: Webhook MP
│   │   ├── materials.routes.ts     # Presigned URLs R2
│   │   └── admin.routes.ts
│   ├── services/
│   │   ├── payment.service.ts   # Lógica PIX + Split
│   │   ├── webhook.service.ts   # Processamento do webhook
│   │   └── r2.service.ts        # Geração de presigned URLs
│   └── index.ts
```

---

### Fluxo Crítico: PIX com Split de Pagamento

#### `POST /api/transactions/create-pix`

**Corpo da requisição:**
```json
{
  "media_card_id": "uuid",
  "tccine_requested": false
}
```

**Lógica em `payment.service.ts`:**

```typescript
import { MercadoPagoConfig, Payment } from 'mercadopago';

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_PLATFORM_ACCESS_TOKEN! });

export async function createPixWithSplit(params: {
  buyer: User;
  seller: User;
  card: MediaCard;
  tccineRequested: boolean;
}) {
  const { buyer, seller, card, tccineRequested } = params;

  // 1. Busca taxa de comissão da tabela commission_settings
  const feePercent = await getCommissionFee(card.media_type); // e.g. 10%
  const platformFee = (card.price * feePercent) / 100;
  const sellerAmount = card.price - platformFee;

  // 2. Cria o pagamento PIX com split (marketplace split)
  const paymentData = {
    transaction_amount: card.price,
    description: `Cotapubli - ${card.title}`,
    payment_method_id: 'pix',
    payer: {
      email: buyer.email,
      first_name: buyer.name,
    },
    // Split: define o recebedor e o valor que ele recebe
    // O restante (platformFee) fica na conta da plataforma
    application_fee: platformFee,
    // collector_id é o mp_user_id do vendor
    // Requer que o seller tenha autorizado via OAuth
    marketplace_fee: platformFee,
    metadata: {
      buyer_id: buyer.id,
      seller_id: seller.id,
      media_card_id: card.id,
      tccine_requested: tccineRequested,
    },
  };

  const payment = new Payment(mp);
  const result = await payment.create({ body: paymentData });

  // 3. Salva transaction no Supabase
  const transaction = await supabaseAdmin.from('transactions').insert({
    buyer_id: buyer.id,
    seller_id: seller.id,
    media_card_id: card.id,
    total_amount: card.price,
    platform_fee: platformFee,
    seller_amount: sellerAmount,
    mp_payment_id: String(result.id),
    pix_qr_code: result.point_of_interaction?.transaction_data?.qr_code_base64,
    pix_code: result.point_of_interaction?.transaction_data?.qr_code,
    pix_expires_at: result.date_of_expiration,
    tccine_requested: tccineRequested,
    tccine_status: tccineRequested ? 'pending' : 'not_applicable',
  }).select().single();

  return transaction.data;
}
```

> [!IMPORTANT]
> O Split de Pagamento do Mercado Pago exige que o seller conecte sua conta via **OAuth 2.0** do Mercado Pago. O campo `mp_access_token` e `mp_user_id` na tabela `users` armazena essas credenciais. A plataforma deve ter um fluxo de onboarding onde o seller autoriza o acesso.

---

### Fluxo Crítico: Webhook do Mercado Pago

#### `POST /api/webhook/mercadopago`

```typescript
// webhook.service.ts
export async function handleMercadoPagoWebhook(body: any, signature: string) {
  // 1. Valida a assinatura HMAC do webhook (segurança obrigatória)
  const isValid = validateMPSignature(body, signature, process.env.MP_WEBHOOK_SECRET!);
  if (!isValid) throw new Error('Invalid webhook signature');

  const { type, data } = body;

  if (type === 'payment') {
    const paymentId = data.id;

    // 2. Consulta o pagamento diretamente na API do MP (não confiar apenas no webhook)
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_PLATFORM_ACCESS_TOKEN! });
    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: paymentId });

    const mpStatus = paymentData.status; // 'approved' | 'pending' | 'rejected'

    // 3. Mapeia status MP → status interno
    const statusMap: Record<string, string> = {
      approved: 'paid',
      rejected: 'failed',
      cancelled: 'failed',
      refunded: 'refunded',
    };
    const internalStatus = statusMap[mpStatus] ?? 'pending';

    // 4. Atualiza a transaction no Supabase
    const { data: tx } = await supabaseAdmin
      .from('transactions')
      .update({
        status: internalStatus,
        campaign_status: internalStatus === 'paid'
          ? (paymentData.metadata.tccine_requested ? 'awaiting_material' : 'awaiting_material')
          : 'awaiting_payment',
        updated_at: new Date().toISOString(),
      })
      .eq('mp_payment_id', String(paymentId))
      .select()
      .single();

    // 5. Se pago e TCCINE solicitado, notifica equipe interna (ex: email/Slack)
    if (internalStatus === 'paid' && tx?.tccine_requested) {
      await notifyTccineTeam(tx);
    }
  }
}
```

**Rota pública (sem auth JWT) para receber o webhook:**
```typescript
// webhook.routes.ts — sem middleware de auth
router.post('/mercadopago',
  express.raw({ type: 'application/json' }), // raw body para validar assinatura
  webhookController.handleMercadoPago
);
```

---

## 3. Integração de Storage (Cloudflare R2 — Presigned URLs)

### Estratégia: Upload Direto do Cliente para o R2

O backend **nunca recebe o arquivo** — apenas emite uma URL pré-assinada. O upload acontece direto do browser para o R2, economizando banda e custo de servidor.

```
Browser → [1] POST /api/materials/presign → Backend
Backend → [2] Gera Presigned URL (AWS SDK v3, endpoint R2) → retorna URL
Browser → [3] PUT <presigned-url> com o arquivo → R2 direto
Browser → [4] POST /api/materials/confirm com { file_url } → Backend salva no DB
```

### `r2.service.ts`

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUploadUrl(params: {
  key: string;        // ex: "materials/transaction-uuid/video.mp4"
  contentType: string;
  expiresIn?: number; // segundos, default 300
}) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: params.key,
    ContentType: params.contentType,
  });

  const url = await getSignedUrl(r2, command, {
    expiresIn: params.expiresIn ?? 300,
  });

  // URL pública permanente após o upload
  const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${params.key}`;

  return { uploadUrl: url, publicUrl };
}
```

**Rota:**
```typescript
// POST /api/materials/presign
// Body: { transaction_id, file_name, content_type }
// Retorna: { upload_url, public_url }
```

> [!NOTE]
> O R2 usa zero egress fee, portanto streaming de vídeos de anúncios diretamente pela URL pública do R2 (via domínio customizado) não gera custo de saída.

---

## 4. Stack e Estrutura de Projetos

```
cotapubli/
├── frontend/          # Next.js App Router + Tailwind + TypeScript
│   ├── app/
│   │   ├── (public)/     # Landing, cards públicos
│   │   ├── (buyer)/      # Dashboard do comprador
│   │   ├── (seller)/     # Dashboard do vendedor
│   │   └── (admin)/      # Painel admin
│   └── components/
│       ├── cards/
│       ├── checkout/
│       ├── chat/
│       └── animations/   # Lottie components
└── backend/           # Node.js + Express + TypeScript
    └── src/ ...       # (estrutura acima)
```

---

## Verificação (Pós-Aprovação)

> Esta seção será expandida na fase de EXECUTION.

### Testes Automatizados
- Unit tests para `payment.service.ts` (mock do SDK MP)
- Unit tests para `webhook.service.ts` (mock de assinaturas e status)
- Unit tests para `r2.service.ts` (mock do S3Client)

### Verificação Manual
1. **PIX Flow**: Criar transação → receber QR Code → simular webhook "approved" via Mercado Pago Sandbox
2. **Split**: Verificar na dashboard do MP Sandbox que o seller recebeu o valor correto
3. **R2 Upload**: Obter presigned URL → fazer PUT com arquivo → confirmar URL pública acessível
4. **Chat**: Abrir dois browsers → enviar mensagem → confirmar entrega em tempo real via Supabase Realtime
5. **RLS**: Tentar acessar dados de outro usuário com JWT válido mas de role diferente
