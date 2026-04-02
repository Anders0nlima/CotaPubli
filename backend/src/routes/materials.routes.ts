import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { generatePresignedUploadUrl, MediaFolder } from '../services/r2.service';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';

const router = Router();

const presignSchema = z.object({
  transaction_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  content_type: z.enum([
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime',
    'application/pdf',
  ]),
});

// POST /api/materials/presign
// Returns a presigned PUT URL. Browser uploads directly to R2 — server never sees the file.
router.post('/presign', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { transaction_id, file_name, content_type } = parsed.data;

  // Verify the requesting user is a participant of this transaction
  const { data: tx } = await supabaseAdmin
    .from('transactions')
    .select('id, buyer_id, seller_id, status')
    .eq('id', transaction_id)
    .single();

  if (!tx || (tx.buyer_id !== user.id && tx.seller_id !== user.id && user.role !== 'admin')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (tx.status !== 'paid') {
    res.status(400).json({ error: 'Transaction not yet paid' });
    return;
  }

  const folder: MediaFolder = 'campaign-materials';
  const { uploadUrl, publicUrl } = await generatePresignedUploadUrl({
    folder,
    ownerId: transaction_id,
    fileName: file_name,
    contentType: content_type,
  });

  res.json({ upload_url: uploadUrl, public_url: publicUrl });
});

// POST /api/materials/confirm — saves the file record after successful upload
const confirmSchema = z.object({
  transaction_id: z.string().uuid(),
  public_url: z.string().url(),
  file_type: z.enum(['image', 'video', 'document']),
});

router.post('/confirm', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { transaction_id, public_url, file_type } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from('campaign_materials')
    .insert({
      transaction_id,
      uploader_id: user.id,
      file_url: public_url,
      file_type,
      approval_status: 'pending',
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }

  // Update campaign status to in_review
  await supabaseAdmin
    .from('transactions')
    .update({ campaign_status: 'in_review', updated_at: new Date().toISOString() })
    .eq('id', transaction_id);

  res.status(201).json(data);
});

// GET /api/materials/:transaction_id
router.get('/:transaction_id', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { data: tx } = await supabaseAdmin
    .from('transactions')
    .select('buyer_id, seller_id')
    .eq('id', req.params.transaction_id)
    .single();

  if (!tx || (tx.buyer_id !== user.id && tx.seller_id !== user.id && user.role !== 'admin')) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  const { data, error } = await supabaseAdmin
    .from('campaign_materials')
    .select('*')
    .eq('transaction_id', req.params.transaction_id)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;
