# Conta Única com Perfilamento Progressivo — Modelo Airbnb

Migração da lógica de "Buyer/Seller" estático para um modelo de conta única onde qualquer usuário pode se tornar vendedor ao cadastrar um espaço publicitário.

## User Review Required

> [!IMPORTANT]
> **Breaking Change no Banco de Dados**: O campo `role` na tabela `users` será mantido, mas seu significado muda — ele passa a ser calculado/derivado automaticamente com base na existência de anúncios, ao invés de ser definido no cadastro. Usuários existentes com `role = 'seller'` continuarão funcionando normalmente.

> [!IMPORTANT]
> **Rota `/registro` será eliminada**: O formulário de cadastro complexo (com seleção de role, CPF/CNPJ, nome completo) será substituído por um fluxo simplificado na própria página `/login` — unificando login e cadastro no mesmo modal/página (padrão Airbnb). O CPF/CNPJ será coletado apenas no momento de publicar um anúncio.

> [!WARNING]
> **Remoção de `requireRole('seller')` no backend**: As rotas de criação de cards não exigirão mais `role = 'seller'`. Qualquer usuário autenticado poderá criar um `ad_space`. O campo `role` se torna um helper, não um gatekeeper.

---

## Análise das Referências Airbnb

Baseado nas 16 imagens de referência analisadas:

| Imagem | Padrão Identificado |
|--------|---------------------|
| 1–3 | Modal centralizado sobre fundo de imagem. Login por email → cadastro simples (nome, sobrenome) → aceite de termos da comunidade |
| 4 | Landing page "É muito fácil anunciar no Airbnb" — 3 etapas resumidas com ilustrações |
| 5–6 | Wizard multi-step — "Etapa 1: Descreva sua acomodação" com barra de progresso + botões Voltar/Avançar |
| 7 | Seleção de categoria com cards grid (ícone + label) |
| 8 | Busca de localização com autocomplete |
| 9 | Confirmação de localização com mapa |
| 10 | Transição de etapa — "Etapa 2: Faça sua acomodação se destacar" |
| 11 | Seleção de amenidades com grids de cards selecionáveis |
| 12 | Upload de fotos com drag-and-drop |
| 13 | Wizard com botão "Salvar e sair" sempre visível |
| 14 | Dashboard do host com header alternativo (Hoje, Calendário, Anúncios, Mensagens) + "Vou viajar" |
| 15 | Menu dropdown com "Crie um novo anúncio" |
| 16 | Perfil com label "Anfitrião(a)" e header contextual |

---

## Proposed Changes

### Componente 1: Banco de Dados (Supabase Schema)

Alterações na modelagem para suportar conta única e sistema de rascunho.

#### [MODIFY] [schema.sql](file:///c:/Projetos/CotaPubli/backend/supabase/schema.sql)

**Tabela `users` — Tornar `role` flexível:**
```sql
-- ANTES: role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'admin'))
-- DEPOIS: role tem DEFAULT 'buyer' e a coluna vira computada/derivada
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'buyer';
```
O campo `role` permanece como `TEXT NOT NULL` mas o default passa a ser `'buyer'`. 
A role muda automaticamente para `'seller'` quando o usuário publica seu primeiro anúncio.

Adicionar campos opcionais para perfilamento progressivo:
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS document TEXT; -- CPF/CNPJ, coletado só no publish
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ;
```

**Nova tabela `ad_spaces` (substituindo a dependência exclusiva de `media_cards`):**

A tabela `media_cards` existente já serve como base. Vamos adicionar suporte completo a drafts:
```sql
-- Adicionar campos para suportar wizard multi-step e drafts
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS wizard_step INT DEFAULT 0;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_lat NUMERIC(10, 7);
ALTER TABLE public.media_cards ADD COLUMN IF NOT EXISTS location_lng NUMERIC(10, 7);

-- Alterar o CHECK do status para incluir 'pending_approval'
ALTER TABLE public.media_cards DROP CONSTRAINT IF EXISTS media_cards_status_check;
ALTER TABLE public.media_cards ADD CONSTRAINT media_cards_status_check 
  CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'sold'));
```

**Atualizar RLS — Permitir qualquer autenticado criar cards (não só seller):**
```sql
-- Remover a policy antiga que exige seller
DROP POLICY IF EXISTS "seller_own_cards" ON public.media_cards;

-- Nova policy: qualquer autenticado gerencia seus próprios cards
CREATE POLICY "owner_own_cards" ON public.media_cards FOR ALL TO authenticated
  USING (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
  WITH CHECK (seller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
```

---

### Componente 2: Backend API (Express)

Atualizar middlewares e rotas para remover a dependência de role estática.

#### [MODIFY] [rbac.ts](file:///c:/Projetos/CotaPubli/backend/src/middlewares/rbac.ts)

Manter o middleware mas criar um novo `requireAuth` que não verifica role (apenas verifica se o user existe). O `requireRole` continua para admin.

#### [NEW] [listing.routes.ts](file:///c:/Projetos/CotaPubli/backend/src/routes/listing.routes.ts)

Novas rotas para o wizard de criação:
- `POST /api/listings` — Criar rascunho (qualquer autenticado)
- `PATCH /api/listings/:id` — Atualizar rascunho step-by-step
- `POST /api/listings/:id/publish` — Publicar (muda status para `pending_approval`, promove user a seller)
- `GET /api/listings/my/drafts` — Buscar rascunhos do usuário

#### [MODIFY] [cards.routes.ts](file:///c:/Projetos/CotaPubli/backend/src/routes/cards.routes.ts)

Remover `requireRole('seller')` das rotas de criação e edição. Usar apenas `authMiddleware`.

#### [MODIFY] [index.ts](file:///c:/Projetos/CotaPubli/backend/src/index.ts)

Registrar nova rota `/api/listings`.

---

### Componente 3: UI — Autenticação Simplificada

Login e Cadastro unificados em uma única página minimalista, inspirada no Airbnb.

#### [MODIFY] [login/page.tsx](file:///c:/Projetos/CotaPubli/frontend/src/app/login/page.tsx) → será reescrito como página unificada

Design: 
- Fundo com imagem/gradiente nas laterais (padrão Airbnb imagem1.png)
- Modal centralizado com:
  - Logo CotaPubli
  - "Entrar ou cadastrar-se"
  - Campo de email
  - Botão "Continuar" → se e-mail existe, mostra campo de senha; se não, mostra campos de cadastro (nome + senha + aceite de termos)
  - Divisor "ou"
  - Botão Google OAuth

#### [DELETE] [registro/page.tsx](file:///c:/Projetos/CotaPubli/frontend/src/app/registro/page.tsx)

A página de registro separada será removida. O flow fica unificado em `/login`.

#### [MODIFY] [AuthContext.tsx](file:///c:/Projetos/CotaPubli/frontend/src/contexts/AuthContext.tsx)

- Remover `UserRole` do `register()` — cadastro não pede mais role
- Remover `setUserRole()` — role não é mais alternável manualmente
- Adicionar `hasListings` e `hasDrafts` no UserProfile
- Atualizar `fetchProfile()` para buscar contagem de drafts  
- Simplificar `register(email, password, name)` — sem role

#### [MODIFY] [auth/callback/page.tsx](file:///c:/Projetos/CotaPubli/frontend/src/app/auth/callback/page.tsx)

Redirecionar para `/` (home) ao invés de `/dashboard` após OAuth.

---

### Componente 4: UI — Wizard "Anuncie seu Espaço" (`/anunciar`)

Fluxo multi-step inspirado nas referências Airbnb (imagens 4–13).

#### [NEW] [anunciar/layout.tsx](file:///c:/Projetos/CotaPubli/frontend/src/app/anunciar/layout.tsx)

Layout isolado do wizard — sem Header/Footer normais. Apenas:
- Logo CotaPubli (canto superior esquerdo)
- Botões "Dúvidas?" e "Salvar e sair" (canto superior direito)
- Barra de progresso inferior
- Botões "Voltar" e "Avançar" no footer

#### [NEW] [anunciar/page.tsx](file:///c:/Projetos/CotaPubli/frontend/src/app/anunciar/page.tsx)

Componente principal do wizard com gerenciamento de steps:

**Etapas do Wizard:**

| Step | Título | Descrição | Componente |
|------|--------|-----------|------------|
| 0 | Visão Geral | "É fácil anunciar no CotaPubli" — Landing com 3 pilares | `StepOverview` |
| 1 | Etapa 1 Intro | "Descreva seu espaço" — Transição com ilustração | `StepDescribeIntro` |
| 2 | Categoria | Seleção de tipo (Outdoor, Painel LED, TV, Rádio, etc.) | `StepCategory` |
| 3 | Localização | Endereço + cidade/estado | `StepLocation` |
| 4 | Etapa 2 Intro | "Faça seu espaço se destacar" — Transição | `StepHighlightIntro` |
| 5 | Fotos | Upload de fotos com drag-and-drop (Salvar e Sair a partir daqui) | `StepPhotos` |
| 6 | Título e Descrição | Campos de texto | `StepTitleDescription` |
| 7 | Etapa 3 Intro | "Concluir e publicar" — Transição | `StepPublishIntro` |
| 8 | Preço | Definir valor | `StepPrice` |
| 9 | Revisão | Resumo de tudo + botão "Publicar" | `StepReview` |

**Gerenciamento de Estado:**
- Zustand store (`useListingStore`) para manter dados entre steps
- A partir do Step 5 (Fotos), cada "Avançar" salva automaticamente no Supabase como `draft`
- "Salvar e sair" persiste o estado atual e redireciona para home

#### [NEW] [anunciar/steps/](file:///c:/Projetos/CotaPubli/frontend/src/app/anunciar/steps/) — Diretório

Componentes individuais para cada step do wizard.

#### [NEW] [stores/listingStore.ts](file:///c:/Projetos/CotaPubli/frontend/src/stores/listingStore.ts)

Zustand store para o estado do wizard:
```typescript
interface ListingDraft {
  id?: string;           // UUID do Supabase (set after first save)
  media_type: string;
  location_address: string;
  location_city: string;
  location_state: string;
  photos: string[];      // URLs do R2
  title: string;
  description: string;
  price: number;
  wizard_step: number;
}
```

---

### Componente 5: UI — Header & Navegação

Atualizar o header para o novo modelo.

#### [MODIFY] [Header.tsx](file:///c:/Projetos/CotaPubli/frontend/src/components/Header.tsx)

Mudanças:
1. **Adicionar botão "Anuncie seu Espaço"** — Sempre visível (desktop), leva para `/anunciar`
2. **Se logado com drafts** → botão muda para "Continue seu anúncio" e leva direto ao draft
3. **Remover "Alternar para Vendedor/Comprador"** — Não faz mais sentido
4. **Remover link "Para donos de mídia"** — Substituído pelo botão "Anuncie seu Espaço"
5. **Dropdown do perfil**: Remover exibição de role, adicionar "Meus Anúncios" link (se tiver anúncios)
6. **Se o user tem anúncios publicados**: Mostrar label sutil "Anunciante" no dropdown

#### [MODIFY] [page.tsx (Home)](file:///c:/Projetos/CotaPubli/frontend/src/app/page.tsx)

Ajustar o Hero Section:
- "Quero vender meu espaço" → link para `/anunciar` em vez de `/registro`
- Remover menções a "Vendedor" / separação de roles

#### [MODIFY] [dashboard/page.tsx](file:///c:/Projetos/CotaPubli/frontend/src/app/dashboard/page.tsx)

- Unificar dashboards: Ao invés de `BuyerDashboard`/`SellerDashboard`, render um único dashboard
- Se o user tem anúncios → mostrar seção "Meus Espaços"
- Se o user não tem anúncios → mostrar CTA "Anuncie seu Espaço" com card atrativo
- Manter `AdminDashboard` separado

---

## Open Questions

> [!IMPORTANT]
> **1. Tabela `media_cards` vs nova tabela `ad_spaces`:** Prefere que eu reutilize a tabela `media_cards` existente (adicionando os novos campos de localização/wizard_step) ou crie uma nova tabela `ad_spaces` em paralelo? **Minha recomendação:** Reutilizar `media_cards` para evitar migração de dados e manter as referências da tabela `transactions`.

> [!IMPORTANT]
> **2. Upload de fotos no Wizard:** O sistema de upload do R2 (Cloudflare) já está parcialmente implementado com presigned URLs. Deseja que eu use essa mesma infra no wizard, ou prefere que os uploads passem pelo Supabase Storage nesta etapa (mais simples, menos config)?

> [!IMPORTANT]
> **3. Rota `/registro`:** Ao removê-la, devo criar um redirect permanente de `/registro` → `/login` para não quebrar links externos?

> [!IMPORTANT]
> **4. Schema SQL vs Migration:** Devo gerar os comandos SQL como `ALTER TABLE` para aplicar sobre o banco existente, ou reescrever o `schema.sql` inteiro como referência? **Minha recomendação:** Gerar ambos — o schema.sql completo atualizado + um arquivo `migration_v2.sql` com os ALTERs incrementais.

---

## Verification Plan

### Automated Tests
1. **Build check**: `npm run build` no frontend para garantir zero erros de TypeScript
2. **Backend start**: `npm run dev` no backend confirmando rotas registradas
3. **Fluxo de login via browser**: Testar login por email (visual + funcional)
4. **Wizard flow via browser**: Navegar por todas as etapas do wizard verificando UI e persistência

### Manual Verification
1. Testar cadastro de novo usuário → verificar que é redirecionado para Home (não dashboard)
2. Testar "Anuncie seu Espaço" → wizard abre corretamente
3. Testar "Salvar e Sair" no step 5+ → verificar que draft persiste no Supabase
4. Testar "Continue seu anúncio" no Header → retoma do step correto
5. Testar publicação completa → status muda para `pending_approval` + role muda para `seller`

### Arquivos Impactados (Resumo)

| Ação | Arquivo |
|------|---------|
| MODIFY | `backend/supabase/schema.sql` |
| NEW | `backend/supabase/migration_v2.sql` |
| MODIFY | `backend/src/middlewares/rbac.ts` |
| NEW | `backend/src/routes/listing.routes.ts` |
| MODIFY | `backend/src/routes/cards.routes.ts` |
| MODIFY | `backend/src/index.ts` |
| MODIFY | `frontend/src/contexts/AuthContext.tsx` |
| REWRITE | `frontend/src/app/login/page.tsx` |
| DELETE | `frontend/src/app/registro/page.tsx` |
| MODIFY | `frontend/src/app/auth/callback/page.tsx` |
| NEW | `frontend/src/app/anunciar/layout.tsx` |
| NEW | `frontend/src/app/anunciar/page.tsx` |
| NEW | `frontend/src/app/anunciar/steps/*.tsx` (7-10 components) |
| NEW | `frontend/src/stores/listingStore.ts` |
| MODIFY | `frontend/src/components/Header.tsx` |
| MODIFY | `frontend/src/app/page.tsx` |
| MODIFY | `frontend/src/app/dashboard/page.tsx` |
| MODIFY | `frontend/src/app/globals.css` (novas animações wizard) |
