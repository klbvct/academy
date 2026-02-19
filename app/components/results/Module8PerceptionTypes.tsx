import React from 'react';

interface Module8Props {
  scores: Record<string, number>;
}

export function Module8PerceptionTypes({ scores }: Module8Props) {
  const perceptionTypes: Record<string, { name: string; color: string; description: string }> = {
    m8_visual: {
      name: 'Візуальний',
      color: '#3B82F6',
      description: 'Зорове сприйняття. Краще сприймає інформацію через образи, діаграми, відео. Мислить картинками.',
    },
    m8_auditory: {
      name: 'Аудіальний',
      color: '#10B981',
      description: 'Слухове сприйняття. Краще сприймає інформацію на слух, через лекції, аудіокниги, обговорення.',
    },
    m8_kinesthetic: {
      name: 'Кінестетичний',
      color: '#F59E0B',
      description: 'Тактильне сприйняття + нюх + рух. Потребує практичного досвіду, фізичної взаємодії з матеріалом.',
    },
    m8_digital: {
      name: 'Дискретний/Дигітальний',
      color: '#8B5CF6',
      description: 'Логічний аналіз, робота з цифрами, символами, знаками. Сприймає через логічні схеми та структури.',
    },
  };

  const keys = Object.keys(perceptionTypes);
  const totalScore = keys.reduce((sum, k) => sum + (Number(scores[k]) || 0), 0);

  // Calculate percentages and sort
  const sorted = keys
    .map((k) => ({
      key: k,
      ...perceptionTypes[k],
      score: Number(scores[k]) || 0,
      percent: totalScore > 0 ? ((Number(scores[k]) || 0) / totalScore) * 100 : 0,
    }))
    .sort((a, b) => b.percent - a.percent);

  const dominantType = sorted[0];

  // SVG donut calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // Calculate label positions
  let cAngle = 0;
  const labels = sorted.map((seg) => {
    const segAngle = (seg.percent / 100) * 360;
    const mid = cAngle + segAngle / 2;
    const rad = (mid * Math.PI) / 180;
    const tx = 100 + radius * Math.cos(rad);
    const ty = 100 + radius * Math.sin(rad);
    cAngle += segAngle;
    return { ...seg, tx, ty, show: seg.percent >= 5 };
  });

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
          07
        </span>
        Типологія сприйняття
      </h2>
      
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <p style={{ marginBottom: '12px', lineHeight: '1.6', fontSize: '13px' }}>
          <strong style={{ color: '#1e3a8a' }}>Типологія сприйняття</strong> — визначення домінуючих каналів отримання та обробки інформації. Типи: візуальний (зорове сприйняття), аудіальний (слухове), кінестетичний (тактильне + рух), дискретний (логічний аналіз).
        </p>
      </div>

      {sorted.length > 0 && totalScore > 0 ? (
        <>
          {/* Donut chart + legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '30px auto', gap: '40px', maxWidth: '700px' }}>
            {/* SVG Donut */}
            <div style={{ flexShrink: 0 }}>
              <svg viewBox="0 0 200 200" style={{ width: '300px', height: '300px', transform: 'rotate(-90deg)' }}>
                {(() => {
                  let offset = 0;
                  return sorted.map((seg) => {
                    const sl = (seg.percent / 100) * circumference;
                    const gap = 1;
                    const el = (
                      <circle key={seg.key} cx="100" cy="100" r={radius} fill="none"
                        stroke={seg.color} strokeWidth="40"
                        strokeDasharray={`${sl - gap} ${circumference - sl + gap}`}
                        strokeDashoffset={-offset} opacity="0.9" />
                    );
                    offset += sl;
                    return el;
                  });
                })()}
                <circle cx="100" cy="100" r="50" fill="white" />
                {/* Percent labels */}
                {labels.map((l) =>
                  l.show ? (
                    <text key={l.key} x={l.tx} y={l.ty} textAnchor="middle" dominantBaseline="middle"
                      style={{ fontSize: '12px', fontWeight: 'bold', fill: 'white', transform: 'rotate(90deg)', transformOrigin: `${l.tx}px ${l.ty}px`, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      {Math.round(l.percent)}%
                    </text>
                  ) : null
                )}
                <text x="100" y="100" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold', fill: '#2D3748', transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>
                  Сприйняття
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div style={{ flex: '1', marginLeft: '20px' }}>
              {sorted.map((seg) => (
                <div key={seg.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '20px', height: '20px', background: seg.color, borderRadius: '4px', marginRight: '10px', flexShrink: 0 }} />
                  <div style={{ flex: '1' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{seg.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{Math.round(seg.percent)}% ({seg.score} балів)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#1e3a8a' }}><strong>Характеристика типів сприйняття:</strong></h3>
          <ul style={{ lineHeight: '1.8' }}>
            {sorted.map((seg) => (
              <li key={seg.key} style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>{seg.name} ({Math.round(seg.percent)}%)</strong> — {seg.description}
              </li>
            ))}
          </ul>

          {/* Learning recommendation */}
          {dominantType && (
            <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
              <h4 style={{ color: '#1e3a8a', marginBottom: '15px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Рекомендації для навчання:</h4>
              <div style={{ lineHeight: '1.6', fontSize: '13px' }}>
                <p style={{ marginBottom: '10px' }}>
                  <strong>Домінуючий тип сприйняття:</strong> <strong style={{ color: '#1e3a8a' }}>{dominantType.name}</strong>
                </p>
                <p style={{ marginBottom: 0 }}>
                  Рекомендується використовувати навчальні матеріали, які відповідають вашому типу сприйняття. 
                  Однак розвивайте всі канали, оскільки комплексне сприйняття інформації підвищує ефективність навчання.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Недостатньо даних для визначення типу сприйняття. Переконайтеся, що тестування пройдено повністю.</p>
      )}
    </section>
  );
}
