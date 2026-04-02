import crypto from 'crypto';
import { Payment } from 'mercadopago';
import { mpConfig } from '../config/mercadopago';
import { supabaseAdmin } from '../config/supabase';

/**
 * Validates the HMAC-SHA256 signature Mercado Pago sends on webhook requests.
 * Reference: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export function validateMPSignature(
  rawBody: string,
  xSignature: string,
  xRequestId: string,
  secret: string
): boolean {
  // signature header format: "ts=<timestamp>,v1=<hmac>"
  const parts = xSignature.split(',');
  const ts = parts.find((p) => p.startsWith('ts='))?.split('=')[1];
  const v1 = parts.find((p) => p.startsWith('v1='))?.split('=')[1];
  if (!ts || !v1) return false;

  const signedTemplate = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(signedTemplate)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expectedHash));
}

export async function handleMercadoPagoWebhook(body: {
  type: string;
  data: { id: string };
}) {
  if (body.type !== 'payment') return { skipped: true };

  const paymentId = body.data.id;
  const paymentClient = new Payment(mpConfig);

  // Always re-fetch from MP to get authoritative status — never trust webhook body alone
  const paymentData = await paymentClient.get({ id: paymentId });
  const mpStatus = paymentData.status;

  const statusMap: Record<string, string> = {
    approved: 'paid',
    rejected: 'failed',
    cancelled: 'failed',
    refunded: 'refunded',
    in_process: 'pending',
    pending: 'pending',
  };
  const internalStatus = statusMap[mpStatus ?? ''] ?? 'pending';

  const tccineRequested = paymentData.metadata?.tccine_requested === true;

  const newCampaignStatus = internalStatus === 'paid' ? 'awaiting_material' : 'awaiting_payment';
  const newTccineStatus = internalStatus === 'paid' && tccineRequested ? 'pending' : undefined;

  const updatePayload: Record<string, unknown> = {
    status: internalStatus,
    campaign_status: newCampaignStatus,
    updated_at: new Date().toISOString(),
  };
  if (newTccineStatus) updatePayload.tccine_status = newTccineStatus;

  const { data: tx, error } = await supabaseAdmin
    .from('transactions')
    .update(updatePayload)
    .eq('mp_payment_id', paymentId)
    .select()
    .single();

  if (error) throw new Error(`Webhook DB update failed: ${error.message}`);

  // TODO: trigger notification to TCCINE team if tccine_requested === true && paid
  if (internalStatus === 'paid' && tccineRequested) {
    console.info(`[TCCINE] Production requested for transaction ${tx?.id}`);
    // e.g. call an email/Slack webhook here
  }

  return { processed: true, transactionId: tx?.id, status: internalStatus };
}
