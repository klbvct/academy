import crypto from 'crypto'

interface LiqPayParams {
  action: string
  version: string
  merchant_id: string
  amount: number
  currency: string
  order_id: string
  description: string
  result_url?: string
  server_url?: string
  customer_first_name?: string
  customer_phone?: string
  customer_email?: string
}

interface LiqPayResponse {
  action: string
  version: string
  merchant_id: string
  order_id: string
  amount: number
  currency: string
  description: string
  signature: string
}

export class LiqPay {
  private merchantId: string
  private secretKey: string

  constructor(merchantId: string, secretKey: string) {
    this.merchantId = merchantId
    this.secretKey = secretKey
  }

  // Генерируем подпись для платежа
  private generateSignature(data: string): string {
    const message = this.secretKey + data + this.secretKey
    return crypto.createHash('sha1').update(message).digest('base64')
  }

  // Генерируем платежную ссылку
  generateCheckoutLink(params: {
    amount: number
    orderId: string
    description: string
    resultUrl: string
    serverUrl: string
    customerFirstName?: string
    customerPhone?: string
    customerEmail?: string
  }): string {
    const liqpayParams: LiqPayParams = {
      action: 'pay',
      version: '3',
      merchant_id: this.merchantId,
      amount: params.amount,
      currency: 'UAH',
      order_id: params.orderId,
      description: params.description,
      result_url: params.resultUrl,
      server_url: params.serverUrl,
      customer_first_name: params.customerFirstName,
      customer_phone: params.customerPhone,
      customer_email: params.customerEmail,
    }

    const data = Buffer.from(JSON.stringify(liqpayParams)).toString('base64')
    const signature = this.generateSignature(data)

    // Формируем URL платежной формы
    const checkoutUrl = new URL('https://www.liqpay.ua/api/3/checkout')
    checkoutUrl.searchParams.append('data', data)
    checkoutUrl.searchParams.append('signature', signature)

    return checkoutUrl.toString()
  }

  // Проверяем подпись callback
  verifyCallback(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data)
    return expectedSignature === signature
  }

  // Декодируем данные из callback
  decodeCallbackData(data: string): Record<string, any> {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8')
    return JSON.parse(decodedData)
  }
}

// Экспортируем функции для использования
export function getLiqPayInstance(): LiqPay {
  const merchantId = process.env.LIQPAY_MERCHANT_ID
  const secretKey = process.env.LIQPAY_PRIVATE_KEY

  if (!merchantId || !secretKey) {
    throw new Error('LiqPay credentials not configured')
  }

  return new LiqPay(merchantId, secretKey)
}
