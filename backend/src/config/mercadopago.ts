import { MercadoPagoConfig } from 'mercadopago';
import 'dotenv/config';

if (!process.env.MP_PLATFORM_ACCESS_TOKEN) {
  console.warn('⚠️ Missing MP_PLATFORM_ACCESS_TOKEN. MercadoPago features will fail.');
}

export const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_PLATFORM_ACCESS_TOKEN || 'dummy',
  options: { timeout: 5000 },
});
