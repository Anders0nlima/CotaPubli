import { Router, Request, Response } from 'express';
import express from 'express';
import { handleMercadoPagoWebhook, validateMPSignature } from '../services/webhook.service';

const router = Router();

// This route receives RAW body (express.raw) so we can validate the HMAC signature
router.post(
  '/mercadopago',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const rawBody = req.body.toString('utf8');
      const xSignature = req.headers['x-signature'] as string ?? '';
      const xRequestId = req.headers['x-request-id'] as string ?? '';
      const secret = process.env.MP_WEBHOOK_SECRET!;

      // Validate signature in production
      if (process.env.NODE_ENV === 'production') {
        const isValid = validateMPSignature(rawBody, xSignature, xRequestId, secret);
        if (!isValid) {
          console.warn('[webhook] Invalid MP signature');
          res.status(400).json({ error: 'Invalid signature' });
          return;
        }
      }

      const body = JSON.parse(rawBody);
      const result = await handleMercadoPagoWebhook(body);

      // Always return 200 fast — MP retries on non-2xx
      res.status(200).json(result);
    } catch (err: any) {
      console.error('[webhook/mercadopago]', err);
      // Still return 200 to stop MP from retrying — log the error for investigation
      res.status(200).json({ received: true, error: err.message });
    }
  }
);

export default router;
