const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const u = await prisma.user.findUnique({where: {email: 'kalabukhov87@gmail.com'}, select: {id: true, fullName: true}});
    console.log('User:', u);
    const r = await prisma.testResult.findFirst({where: {userId: u.id, testId: 1}, select: {id: true, completedAt: true, recommendations: true}});
    console.log('TestResult:', r ? {id: r.id, completedAt: r.completedAt, hasRec: !!r.recommendations} : 'NOT FOUND');
    const pay = await prisma.payment.findFirst({where: {userId: u.id, testId: 1, type: 'results', status: 'success'}});
    console.log('ResultsPayment (success):', pay ? {id: pay.id, status: pay.status, type: pay.type} : 'NOT FOUND');
    const allPay = await prisma.payment.findMany({where: {userId: u.id}});
    console.log('All payments:', allPay.map(x => ({id: x.id, status: x.status, type: x.type, testId: x.testId})));
    const access = await prisma.testAccess.findFirst({where: {userId: u.id, testId: 1}});
    console.log('TestAccess:', access ? {hasAccess: access.hasAccess, paymentId: access.paymentId} : 'NOT FOUND');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
