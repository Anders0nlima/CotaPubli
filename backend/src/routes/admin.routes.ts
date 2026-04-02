import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, requireRole('admin'));

// GET /api/admin/cards/pending — cards awaiting approval
router.get('/cards/pending', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .select('*, users!seller_id(name, email)')
    .eq('is_approved', false)
    .neq('status', 'draft')
    .order('created_at', { ascending: true });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/admin/cards/:id/approve
router.patch('/cards/:id/approve', async (req: Request, res: Response) => {
  const { approved } = req.body; // boolean
  const { data, error } = await supabaseAdmin
    .from('media_cards')
    .update({
      is_approved: !!approved,
      status: approved ? 'active' : 'draft',
    })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// GET /api/admin/materials/pending — campaign materials awaiting review
router.get('/materials/pending', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('campaign_materials')
    .select('*, transactions(buyer_id, seller_id, media_card_id)')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: true });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/admin/materials/:id/approve
router.patch('/materials/:id/approve', async (req: Request, res: Response) => {
  const { approved, review_notes } = req.body;
  const { data, error } = await supabaseAdmin
    .from('campaign_materials')
    .update({
      approval_status: approved ? 'approved' : 'rejected',
      review_notes: review_notes ?? null,
    })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) { res.status(500).json({ error: error.message }); return; }

  // If approved, move campaign to 'approved'
  if (approved && data?.transaction_id) {
    await supabaseAdmin
      .from('transactions')
      .update({ campaign_status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', data.transaction_id);
  }

  res.json(data);
});

// GET /api/admin/dashboard
router.get('/dashboard', async (_req: Request, res: Response) => {
  const [{ count: totalCards }, { count: totalTx }, { count: pendingMaterials }] = await Promise.all([
    supabaseAdmin.from('media_cards').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('campaign_materials').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
  ]);

  const { data: revenue } = await supabaseAdmin
    .from('transactions')
    .select('platform_fee')
    .eq('status', 'paid');

  const totalRevenue = revenue?.reduce((acc, tx) => acc + (tx.platform_fee ?? 0), 0) ?? 0;

  res.json({ totalCards, totalTx, pendingMaterials, totalRevenue });
});

// GET /api/admin/commission-settings
router.get('/commission-settings', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin.from('commission_settings').select('*');
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/admin/commission-settings/:id
router.patch('/commission-settings/:id', async (req: Request, res: Response) => {
  const admin = (req as any).user;
  const { fee_percentage } = req.body;
  const { data, error } = await supabaseAdmin
    .from('commission_settings')
    .update({ fee_percentage, updated_by: admin.id, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;
