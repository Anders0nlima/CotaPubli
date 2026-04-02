import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { createPixWithSplit } from '../services/payment.service';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';

const router = Router();

const createPixSchema = z.object({
  media_card_id: z.string().uuid(),
  tccine_requested: z.boolean().default(false),
});

// POST /api/transactions/create-pix
router.post('/create-pix', authMiddleware, requireRole('buyer'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const parsed = createPixSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const { media_card_id, tccine_requested } = parsed.data;

    // Fetch the media card
    const { data: card, error: cardError } = await supabaseAdmin
      .from('media_cards')
      .select('id, title, price, media_type, seller_id, status, is_approved')
      .eq('id', media_card_id)
      .single();

    if (cardError || !card) {
      res.status(404).json({ error: 'Media card not found' });
      return;
    }
    if (card.status !== 'active' || !card.is_approved) {
      res.status(400).json({ error: 'This media card is not available for purchase' });
      return;
    }

    // Fetch seller profile for split
    const { data: seller } = await supabaseAdmin
      .from('users')
      .select('id, mp_user_id')
      .eq('id', card.seller_id)
      .single();

    const result = await createPixWithSplit({
      buyerId: user.id,
      buyerEmail: user.email,
      buyerName: user.name,
      sellerId: card.seller_id,
      sellerMpUserId: seller?.mp_user_id ?? null,
      cardId: card.id,
      cardTitle: card.title,
      cardPrice: card.price,
      cardMediaType: card.media_type,
      tccineRequested: tccine_requested,
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error('[create-pix]', err);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
  }
});

// GET /api/transactions — buyer sees own, seller sees own, admin sees all
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  let query = supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false });

  if (user.role === 'buyer') query = query.eq('buyer_id', user.id);
  else if (user.role === 'seller') query = query.eq('seller_id', user.id);
  // admin gets all

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// GET /api/transactions/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*, media_cards(*), messages(*)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) { res.status(404).json({ error: 'Transaction not found' }); return; }

  // Auth check: only participants or admin
  if (user.role !== 'admin' && data.buyer_id !== user.id && data.seller_id !== user.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.json(data);
});

export default router;
