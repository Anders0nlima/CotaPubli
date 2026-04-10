import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { processCheckoutMock } from '../services/orders.service';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';

const router = Router();

const checkoutItemSchema = z.object({
  media_card_id: z.string().uuid(),
  tccine_requested: z.boolean().default(false),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
});

// POST /api/orders/checkout
// Mock Checkout: recebe itens do carrinho e finaliza imediatamente como "paid"
router.post('/checkout', authMiddleware, requireRole('buyer'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const parsed = checkoutSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const result = await processCheckoutMock({
      buyerId: user.id,
      items: parsed.data.items,
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error('[checkout-mock]', err);
    res.status(400).json({ error: err.message ?? 'Internal server error' });
  }
});

// GET /api/orders — Buyer vê seus pedidos
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query = supabaseAdmin.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

    // Permissão restrita na rota para garantir RLS de fallback
    if (user.role === 'buyer') {
      query = query.eq('buyer_id', user.id);
    } // admin vê tudo

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — Detalhe do pedido
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, media_cards(*))')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Pedido não encontrado' });
      return;
    }

    if (user.role !== 'admin' && data.buyer_id !== user.id) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
