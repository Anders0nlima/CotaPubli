import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';

const router = Router();

// Schema parcial — wizard salva incrementalmente
const draftSchema = z.object({
  media_type: z.enum(['tv', 'radio', 'outdoor', 'digital', 'influencer']).optional(),
  title: z.string().max(120).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  location_address: z.string().optional(),
  location_city: z.string().optional(),
  location_state: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  cover_url: z.string().optional(),
  media_urls: z.array(z.string()).optional(),
  wizard_step: z.number().int().min(0).max(9).optional(),
});

// POST /api/listings — Criar rascunho (qualquer autenticado)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const parsed = draftSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .insert({
      ...parsed.data,
      seller_id: user.id,
      status: 'draft',
      is_approved: false,
      wizard_step: parsed.data.wizard_step ?? 0,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

// GET /api/listings/my/drafts — Buscar rascunhos do usuário
router.get('/my/drafts', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// GET /api/listings/my/all — Buscar todos os anúncios do usuário
router.get('/my/all', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/listings/:id — Atualizar rascunho step-by-step
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const parsed = draftSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .update(parsed.data)
    .eq('id', req.params.id)
    .eq('seller_id', user.id)
    .in('status', ['draft', 'pending_approval']) // Só pode editar drafts/pending
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data) { res.status(404).json({ error: 'Draft not found or not yours' }); return; }
  res.json(data);
});

// POST /api/listings/:id/publish — Publicar (muda status + promove user a seller)
router.post('/:id/publish', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;

  // Buscar o draft
  const { data: draft, error: fetchError } = await supabaseAdmin
    .from('media_cards')
    .select('*')
    .eq('id', req.params.id)
    .eq('seller_id', user.id)
    .eq('status', 'draft')
    .single();

  if (fetchError || !draft) {
    res.status(404).json({ error: 'Draft not found' });
    return;
  }

  // Validar campos obrigatórios para publicação
  if (!draft.title || !draft.media_type || !draft.price) {
    res.status(400).json({ error: 'Title, media_type and price are required to publish' });
    return;
  }

  // Atualizar status para pending_approval
  const { data: published, error: updateError } = await supabaseAdmin
    .from('media_cards')
    .update({ status: 'pending_approval', wizard_step: 9 })
    .eq('id', req.params.id)
    .select()
    .single();

  if (updateError) { res.status(500).json({ error: updateError.message }); return; }

  // Promover usuário a seller (se ainda não for)
  if (user.role === 'buyer') {
    await supabaseAdmin
      .from('users')
      .update({ role: 'seller' })
      .eq('id', user.id);
  }

  res.json({ ...published, role_promoted: user.role === 'buyer' });
});

// DELETE /api/listings/:id — Deletar rascunho
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;

  const { error } = await supabaseAdmin
    .from('media_cards')
    .delete()
    .eq('id', req.params.id)
    .eq('seller_id', user.id)
    .eq('status', 'draft');

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ success: true });
});

export default router;
