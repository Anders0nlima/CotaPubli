import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { supabaseAdmin } from '../config/supabase';
import { generatePresignedUploadUrl } from '../services/r2.service';
import { z } from 'zod';

const router = Router();

const cardSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().optional(),
  media_type: z.enum(['tv', 'radio', 'outdoor', 'digital', 'influencer']),
  audience: z.record(z.unknown()).optional(),
  metrics: z.record(z.unknown()).optional(),
  price: z.number().positive(),
});

// GET /api/cards — public (active + approved)
router.get('/', async (req: Request, res: Response) => {
  const { media_type, min_price, max_price, search } = req.query;

  let query = supabaseAdmin
    .from('media_cards')
    .select('*, users!seller_id(id, name, avatar_url, is_certified)')
    .eq('status', 'active')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (media_type) query = query.eq('media_type', media_type as string);
  if (min_price) query = query.gte('price', Number(min_price));
  if (max_price) query = query.lte('price', Number(max_price));
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// GET /api/cards/:id — public
router.get('/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .select('*, users!seller_id(id, name, avatar_url, is_certified)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) { res.status(404).json({ error: 'Card not found' }); return; }
  res.json(data);
});

// GET /api/cards/my/listings — seller's own cards
router.get('/my/listings', authMiddleware, requireRole('seller'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// POST /api/cards — seller creates card (draft)
router.post('/', authMiddleware, requireRole('seller'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const parsed = cardSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .insert({ ...parsed.data, seller_id: user.id, status: 'draft', is_approved: false })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

// PATCH /api/cards/:id — seller edits own card
router.patch('/:id', authMiddleware, requireRole('seller'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const parsed = cardSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .update({ ...parsed.data, is_approved: false }) // re-submit for approval on edit
    .eq('id', req.params.id)
    .eq('seller_id', user.id)
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// POST /api/cards/cover-presign — presigned URL for cover image
router.post('/cover-presign', authMiddleware, requireRole('seller'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { file_name, content_type } = req.body;
  if (!file_name || !content_type) { res.status(400).json({ error: 'file_name and content_type required' }); return; }

  const result = await generatePresignedUploadUrl({
    folder: 'card-covers',
    ownerId: user.id,
    fileName: file_name,
    contentType: content_type,
  });
  res.json(result);
});

export default router;
