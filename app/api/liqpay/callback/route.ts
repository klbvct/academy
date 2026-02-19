import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLiqPayInstance } from '@/lib/liqpay'

// POST - обработка callback от LiqPay
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = formData.get('data') as string
    const signature = formData.get('signature') as string

    if (!data || !signature) {
      return NextResponse.json(
        { success: false, message: 'Missing data or signature' },
        { status: 400 }
      )
    }

    // Проверяем подпись callback
    const liqpay = getLiqPayInstance()
    const isValid = liqpay.verifyCallback(data, signature)

    if (!isValid) {
      console.error('Invalid LiqPay signature')
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Декодируем данные callback
    const callbackData = liqpay.decodeCallbackData(data)
    
    console.log('LiqPay Callback:', callbackData)

    // Получаем информацию о платеже из БД
    const payment = await prisma.payment.findUnique({
      where: { orderId: callbackData.order_id },
      include: {
        user: true,
      },
    })

    if (!payment) {
      console.error('Payment not found:', callbackData.order_id)
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      )
    }

    // Обновляем статус платежа на основе ответа LiqPay
    let newStatus = 'pending'
    
    if (callbackData.status === 'success' || callbackData.status === 'completed') {
      newStatus = 'success'
    } else if (callbackData.status === 'failure' || callbackData.status === 'error') {
      newStatus = 'unpaid'
    }

    // Обновляем платеж
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        liqpayTransactionId: callbackData.transaction_id,
        completedAt: newStatus === 'success' ? new Date() : null,
      },
    })

    // Если платеж успешен, обновляем доступ к тесту
    if (newStatus === 'success') {
      // Нужно получить testId из orderId или из другого источника
      // orderId формата: ORDER_userId_testId_timestamp
      const orderParts = callbackData.order_id.split('_')
      if (orderParts.length >= 3) {
        const testId = parseInt(orderParts[2])
        
        // Проверяем, существует ли уже TestAccess
        let testAccess = await prisma.testAccess.findFirst({
          where: {
            userId: payment.userId,
            testId: testId,
          },
        })

        if (testAccess) {
          // Обновляем существующий
          await prisma.testAccess.update({
            where: {
              id: testAccess.id,
            },
            data: {
              paymentId: payment.id,
              hasAccess: true,
              accessGrantedAt: new Date(),
            },
          })
        } else {
          // Создаем новый
          await prisma.testAccess.create({
            data: {
              userId: payment.userId,
              testId: testId,
              paymentId: payment.id,
              hasAccess: true,
              accessGrantedAt: new Date(),
            },
          })
        }

        console.log(`Test access granted for user ${payment.userId}, test ${testId}`)
      }
    }

    // Возвращаем OK для LiqPay
    return NextResponse.json({
      success: true,
      status: newStatus,
    })
  } catch (error) {
    console.error('LiqPay callback error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
