import React from 'react';

interface Module5Props {
  scores: Record<string, number>;
}

export function Module5Intelligences({ scores }: Module5Props) {
  const intelligenceTypes: Record<string, { name: string; color: string; description: string }> = {
    m5_linguistic: {
      name: 'Лінгвістичний',
      color: '#3B82F6',
      description: 'Здатність ефективно використовувати мову, виражати думки усно та письмово. Характерно для письменників, поетів, журналістів, ораторів.',
    },
    m5_logicalMathematical: {
      name: 'Логіко-математичний',
      color: '#8B5CF6',
      description: 'Здатність до логічного мислення, аналізу, роботи з числами та абстрактними поняттями. Характерно для математиків, програмістів, учених.',
    },
    m5_spatial: {
      name: 'Просторово-візуальний',
      color: '#EC4899',
      description: 'Здатність сприймати візуальний світ, створювати мисленні образи, орієнтуватися у просторі. Характерно для художників, архітекторів, дизайнерів.',
    },
    m5_musical: {
      name: 'Музичний',
      color: '#F59E0B',
      description: 'Здатність сприймати, створювати та відтворювати музику, розуміти ритм, тон, тембр. Характерно для музикантів, композиторів, звукорежисерів.',
    },
    m5_bodilyKinesthetic: {
      name: 'Кінестетичний (руховий)',
      color: '#10B981',
      description: 'Здатність контролювати рухи тіла, координація, спритність. Характерно для спортсменів, танцюристів, хірургів, ремісників.',
    },
    m5_interpersonal: {
      name: 'Міжособистісний',
      color: '#EF4444',
      description: 'Здатність розуміти інших людей, їхні наміри, мотивацію, емоції. Характерно для педагогів, психологів, менеджерів, лідерів.',
    },
    m5_intrapersonal: {
      name: 'Внутрішньоособистісний',
      color: '#14B8A6',
      description: 'Здатність розуміти себе, свої емоції, мотиви, цілі. Саморефлексія та самоаналіз. Характерно для філософів, психологів, письменників.',
    },
    m5_naturalistic: {
      name: 'Натуралістичний',
      color: '#84CC16',
      description: 'Здатність розпізнавати та класифікувати об\'єкти природи, розуміти природні явища. Характерно для біологів, екологів, ветеринарів.',
    },
  };

  const keys = Object.keys(intelligenceTypes);
  const rawScores: Record<string, number> = {};
  keys.forEach((k) => { rawScores[k] = Number(scores[k]) || 1; });

  // Scores are already progress values from 1 to 9
  // Sort by progress (higher = more developed)
  const sorted = keys
    .map((k) => ({ 
      key: k, 
      ...intelligenceTypes[k], 
      progress: rawScores[k] // Прогресс от 1 до 9
    }))
    .sort((a, b) => b.progress - a.progress);

  // Calculate ratios and percentages
  const ratios = sorted.map((item) => {
    const notObserved = 10 - item.progress; // Непроявленность
    const percent = (item.progress / 10) * 100; // Процент для визуализации
    return { ...item, notObserved, percent };
  });

  // Top 3
  const topThree = ratios.slice(0, 3);

  return (
    <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
      <h2 className="text-2xl font-bold mb-4 pb-2" style={{ color: '#1e3a8a', borderBottom: '2px solid #0c68f5' }}>
        <span style={{
          display: 'inline-block',
          width: '50px',
          height: '50px',
          backgroundColor: '#f3f4f6',
          color: '#0c68f5',
          borderRadius: '8px',
          textAlign: 'center',
          lineHeight: '50px',
          fontWeight: 'bold',
          fontSize: '20px',
          marginRight: '12px',
          verticalAlign: 'middle'
        }}>
          05
        </span>
        Співвідношення типів інтелекту
      </h2>
      
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <p style={{ marginBottom: '12px', lineHeight: '1.6', fontSize: '13px' }}>
          У цьому розділі представлено визначення типів інтелекту відповідно до теорії множинного інтелекту Говарда Гарднера. Кожен тип оцінюється за шкалою від 1 до 9, де вищий показник відображає більш виражений рівень розвитку та прояву відповідних когнітивних здібностей.
        </p>
      </div>

      {sorted.length > 0 ? (
        <>
          <h3 style={{ marginBottom: '15px', color: '#1e3a8a' }}><strong>Профіль інтелекту:</strong></h3>

          {/* Progress bars with X/10 ratio */}
          <div style={{ flex: '1', margin: '30px 0' }}>
            {ratios.map((item) => (
              <div key={item.key} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: item.color }}>
                    Прогрес: {item.progress}/10
                  </span>
                </div>
                {/* Two-color bar: progress + not observed */}
                <div style={{ display: 'flex', width: '100%', height: '28px', borderRadius: '14px', overflow: 'hidden', border: '2px solid #E5E7EB' }}>
                  <div style={{ width: `${item.percent}%`, background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}dd 100%)` }} />
                  <div style={{ width: `${100 - item.percent}%`, background: '#E5E7EB' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '3px' }}>
                  Співвідношення: {item.progress} до {item.notObserved}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed descriptions */}
          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#1e3a8a' }}><strong>Детальна характеристика типів інтелекту:</strong></h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.8' }}>
            {ratios.map((item) => {
              let level = 'низький';
              let emoji = '⬇️';
              if (item.progress >= 8) { level = 'дуже високий'; emoji = '🔥'; }
              else if (item.progress >= 6) { level = 'високий'; emoji = '✅'; }
              else if (item.progress >= 4) { level = 'середній'; emoji = '➡️'; }
              return (
                <li key={item.key} style={{ marginBottom: '10px', fontSize: '13px', color: '#374151' }}>
                  <strong>{emoji} {item.name} інтелект</strong> — рівень прояву <u>{level}</u> ({item.progress}/10). {item.description}
                </li>
              );
            })}
          </ul>

          {/* Recommendations */}
          <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
            <h4 style={{ color: '#1e3a8a', marginBottom: '15px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Рекомендації для розвитку</h4>
            <div style={{ lineHeight: '1.6', fontSize: '13px' }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>Домінуючі типи інтелекту:</strong>{' '}
                <strong style={{ color: '#1e3a8a' }}>{topThree.map((t) => t.name).join(', ')}</strong>
              </p>
              <p style={{ marginTop: '10px' }}>
                <strong>Рекомендація:</strong> При виборі професії та освітнього напрямку рекомендується орієнтуватися на домінуючі типи інтелекту. 
                Водночас варто розвивати всі типи, оскільки сучасні професії вимагають комплексного підходу та міждисциплінарних навичок.
              </p>
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Недостатньо даних для аналізу типів інтелекту. Переконайтеся, що тестування пройдено повністю.</p>
      )}
    </section>
  );
}
