import { supabaseAdmin } from '../config/supabase';

interface CheckoutItem {
  media_card_id: string;
  tccine_requested?: boolean;
}

interface CheckoutParams {
  buyerId: string;
  items: CheckoutItem[];
}

async function getCommissionFee(mediaType: string | null): Promise<number> {
  const query = supabaseAdmin.from('commission_settings').select('fee_percentage');
  
  const { data } = mediaType 
    ? await query.or(`media_type.eq.${mediaType},media_type.is.null`).order('media_type', { ascending: false, nullsFirst: false }).limit(1).single()
    : await query.is('media_type', null).limit(1).single();

  return data?.fee_percentage ?? 10;
}

export async function processCheckoutMock(params: CheckoutParams) {
  const { buyerId, items } = params;

  if (!items || items.length === 0) {
    throw new Error('O carrinho está vazio.');
  }

  let totalAmount = 0;
  const orderItemsToInsert = [];

  // 1. Processar cada item do carrinho
  for (const item of items) {
    const { data: card, error: cardError } = await supabaseAdmin
      .from('media_cards')
      .select('*')
      .eq('id', item.media_card_id)
      .single();

    if (cardError || !card) {
      throw new Error(`Cota (ID: ${item.media_card_id}) não encontrada.`);
    }

    // Controle de Estoque Mock/Simples: não permite vender o que já não está ativo
    if (card.status !== 'active' || !card.is_approved || card.deleted_at !== null) {
      throw new Error(`A cota "${card.title}" não está mais disponível.`);
    }

    const feePercent = await getCommissionFee(card.media_type);
    const platformFee = parseFloat(((card.price * feePercent) / 100).toFixed(2));
    const sellerAmount = parseFloat((card.price - platformFee).toFixed(2));

    totalAmount += card.price;

    orderItemsToInsert.push({
      media_card_id: card.id,
      seller_id: card.seller_id,
      unit_price: card.price,
      quantity: 1, // Por padrão, MVP assume 1 cota de anúncio específica
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      tccine_requested: item.tccine_requested ?? false,
      tccine_status: item.tccine_requested ? 'pending' : 'not_applicable',
      campaign_status: 'awaiting_payment'
    });
  }

  totalAmount = parseFloat(totalAmount.toFixed(2));

  // 2. Criar a Ordem Principal (Pedido Geral) no banco de dados
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      buyer_id: buyerId,
      total_amount: totalAmount,
      status: 'paid', // Status Mock: Já aprova direto para teste MVP
      payment_method: 'pix',
      mp_payment_id: `MOCK-${Date.now()}` // Mock ID
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(`Erro ao criar Pedido: ${orderError?.message}`);
  }

  // 3. Inserir os Itens relacionados ao pedido criado
  const itemsWithOrderId = orderItemsToInsert.map(i => ({
    ...i,
    order_id: order.id,
    campaign_status: 'awaiting_material' // Já pago no mock, pula para aguardar material
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(itemsWithOrderId);

  if (itemsError) {
    throw new Error(`Erro ao faturar itens do pedido: ${itemsError.message}`);
  }

  // 4. Efetuar baixa no Estoque (atualizar card para "sold")
  for (const item of items) {
    await supabaseAdmin
      .from('media_cards')
      .update({ status: 'sold' })
      .eq('id', item.media_card_id);
  }

  return { message: 'Compra Mock realizada com sucesso!', order };
}
