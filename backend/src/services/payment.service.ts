import { Payment } from 'mercadopago';
import { mpConfig } from '../config/mercadopago';
import { supabaseAdmin } from '../config/supabase';

interface CreatePixParams {
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  sellerId: string;
  sellerMpUserId: string | null;
  cardId: string;
  cardTitle: string;
  cardPrice: number;
  cardMediaType: string;
  tccineRequested: boolean;
}

async function getCommissionFee(mediaType: string): Promise<number> {
  // Try media-type specific fee first, then global default
  const { data } = await supabaseAdmin
    .from('commission_settings')
    .select('fee_percentage')
    .or(`media_type.eq.${mediaType},media_type.is.null`)
    .order('media_type', { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  return data?.fee_percentage ?? 10;
}

export async function createPixWithSplit(params: CreatePixParams) {
  const {
    buyerId, buyerEmail, buyerName,
    sellerId, sellerMpUserId,
    cardId, cardTitle, cardPrice, cardMediaType,
    tccineRequested,
  } = params;

  const feePercent = await getCommissionFee(cardMediaType);
  const platformFee = parseFloat(((cardPrice * feePercent) / 100).toFixed(2));
  const sellerAmount = parseFloat((cardPrice - platformFee).toFixed(2));

  const paymentClient = new Payment(mpConfig);

  const paymentBody: Record<string, unknown> = {
    transaction_amount: cardPrice,
    description: `CotaPubli — ${cardTitle}`,
    payment_method_id: 'pix',
    date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30min
    payer: {
      email: buyerEmail,
      first_name: buyerName,
    },
    metadata: {
      buyer_id: buyerId,
      seller_id: sellerId,
      media_card_id: cardId,
      tccine_requested: tccineRequested,
    },
  };

  // Split de Pagamento — only if seller has connected MP account
  if (sellerMpUserId) {
    paymentBody.application_fee = platformFee;
    // The remaining (sellerAmount) is automatically forwarded to sellerMpUserId
    // This requires Marketplace enabled on your MP account
    paymentBody.marketplace_fee = platformFee;
  }

  const result = await paymentClient.create({ body: paymentBody });

  const pixData = result.point_of_interaction?.transaction_data;

  // Persist transaction in Supabase
  const { data: transaction, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      media_card_id: cardId,
      total_amount: cardPrice,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      mp_payment_id: String(result.id),
      pix_qr_code: pixData?.qr_code_base64 ?? null,
      pix_code: pixData?.qr_code ?? null,
      pix_expires_at: result.date_of_expiration ?? null,
      tccine_requested: tccineRequested,
      tccine_status: tccineRequested ? 'pending' : 'not_applicable',
      status: 'pending',
      campaign_status: 'awaiting_payment',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save transaction: ${error.message}`);

  return {
    transaction,
    pixQrCode: pixData?.qr_code_base64,
    pixCode: pixData?.qr_code,
    expiresAt: result.date_of_expiration,
    mpPaymentId: result.id,
  };
}
