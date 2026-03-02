const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.user.findUnique({
  where: { email: 'i.p@gmail.com' },
  include: { results: true }
}).then(u => {
  if (!u) { console.log('User not found'); return; }
  console.log('User:', u.fullName, u.email);
  if (!u.results || u.results.length === 0) {
    console.log('No results found for this user');
    return;
  }
  u.results.forEach(r => {
    console.log('\nTestResult ID:', r.id, 'testId:', r.testId, 'completedAt:', r.completedAt);
    if (r.scores) {
      const s = JSON.parse(r.scores);
      const m7keys = Object.keys(s).filter(k => k.startsWith('m7'));
      console.log('m7 keys:', m7keys);
      m7keys.forEach(k => console.log(k, '=', JSON.stringify(s[k])));
      if (m7keys.length === 0) {
        console.log('--- No m7 keys! All keys:', Object.keys(s));
      }
    } else {
      console.log('scores field is null/empty');
    }
    // Проверим сырые данные (data)
    if (r.data) {
      const d = JSON.parse(r.data);
      const m7dataKeys = Object.keys(d).filter(k => k.startsWith('m7') || k === 'module7' || k === '7');
      console.log('data m7 keys:', m7dataKeys);
      m7dataKeys.forEach(k => console.log('data['+k+']:', JSON.stringify(d[k]).substring(0, 200)));
      // Покажем все ключи в data
      console.log('All data keys:', Object.keys(d));
    }
  });
}).finally(() => p.$disconnect());
