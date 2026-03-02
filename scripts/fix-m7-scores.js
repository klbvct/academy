/**
 * Пересчитывает m7 скоры для конкретного пользователя
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Маппинг скорера module7 (дублируем логику из TS-файла)
const answerMapping = {
  '1': { a: 'R', b: 'I' },
  '2': { a: 'S', b: 'E' },
  '3': { a: 'A', b: 'C' },
  '4': { a: 'R', b: 'I' },
  '5': { a: 'E', b: 'S' },
  '6': { a: 'A', b: 'C' },
  '7': { a: 'R', b: 'E' },
  '8': { a: 'I', b: 'A' },
  '9': { a: 'S', b: 'E' },
  '10': { a: 'R', b: 'S' },
  '11': { a: 'I', b: 'E' },
  '12': { a: 'A', b: 'C' },
  '13': { a: 'R', b: 'I' },
  '14': { a: 'S', b: 'E' },
  '15': { a: 'A', b: 'C' },
  '16': { a: 'R', b: 'I' },
  '17': { a: 'S', b: 'E' },
  '18': { a: 'A', b: 'C' },
  '19': { a: 'R', b: 'I' },
  '20': { a: 'S', b: 'E' },
  '21': { a: 'A', b: 'C' },
  '22': { a: 'R', b: 'I' },
  '23': { a: 'S', b: 'E' },
  '24': { a: 'A', b: 'C' },
  '25': { a: 'R', b: 'I' },
  '26': { a: 'S', b: 'E' },
  '27': { a: 'A', b: 'C' },
  '28': { a: 'R', b: 'I' },
  '29': { a: 'S', b: 'E' },
  '30': { a: 'A', b: 'C' },
  '31': { a: 'R', b: 'I' },
  '32': { a: 'S', b: 'E' },
  '33': { a: 'A', b: 'C' },
  '34': { a: 'R', b: 'I' },
  '35': { a: 'S', b: 'E' },
  '36': { a: 'A', b: 'C' },
  '37': { a: 'R', b: 'I' },
};

function calculateModule7(moduleData) {
  const rawScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  Object.entries(moduleData).forEach(([key, answer]) => {
    if (!answer) return;
    let questionNum;
    if (key.startsWith('module7_q')) {
      questionNum = key.replace('module7_q', '');
    } else if (key.startsWith('q')) {
      questionNum = key.replace('q', '');
    } else {
      return;
    }
    const mapping = answerMapping[questionNum];
    if (!mapping) return;
    const selected = String(answer).toLowerCase();
    if (selected === 'a' && mapping.a) rawScores[mapping.a] += 1;
    else if (selected === 'b' && mapping.b) rawScores[mapping.b] += 1;
  });

  return {
    m7_r: rawScores.R,
    m7_i: rawScores.I,
    m7_a: rawScores.A,
    m7_s: rawScores.S,
    m7_e: rawScores.E,
    m7_c: rawScores.C,
  };
}

async function run() {
  const user = await p.user.findUnique({
    where: { email: 'i.p@gmail.com' },
    include: { results: true }
  });

  if (!user) { console.log('User not found'); return; }
  console.log('User:', user.fullName);

  for (const result of user.results) {
    if (!result.data) continue;
    const data = JSON.parse(result.data);
    if (!data.module7) { console.log('No module7 data'); continue; }

    const newM7Scores = calculateModule7(data.module7);
    console.log('Recalculated m7 scores:', newM7Scores);

    // Обновляем scores в базе
    const currentScores = result.scores ? JSON.parse(result.scores) : {};
    const updatedScores = { ...currentScores, ...newM7Scores };

    await p.testResult.update({
      where: { id: result.id },
      data: { scores: JSON.stringify(updatedScores) }
    });

    console.log('Updated TestResult ID:', result.id, '— m7 scores saved.');
  }
}

run().finally(() => p.$disconnect());
