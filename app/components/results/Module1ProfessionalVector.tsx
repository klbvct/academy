import React from 'react';

interface Module1Props {
  scores: Record<string, any>;
  recommendations?: any;
}

export function Module1ProfessionalVector({ scores, recommendations }: Module1Props) {
  const vectors = [
    { key: 'm1_nature', label: 'Людина-Природа (П)', color: '#10B981' },
    { key: 'm1_technic', label: 'Людина-Техніка (Т)', color: '#3B82F6' },
    { key: 'm1_human', label: 'Людина-Людина (Ч)', color: '#EF4444' },
    { key: 'm1_sign', label: 'Людина-Знакова система (З)', color: '#8B5CF6' },
    { key: 'm1_art', label: 'Людина-Художній образ (Х)', color: '#F59E0B' },
  ];

  const klimovDescriptions: Record<string, string> = {
    m1_nature: 'Сфери діяльності, пов\'язані з дослідженнями природи, біології, тварин та мікроорганізмів, планети, атмосфери, Землі. Характерні професії: біолог, еколог, ветеринар, агроном, зоотехнік, ландшафтний дизайнер.',
    m1_technic: 'Винахід та створення, виробництво та переробка. Підтримка існуючого технічного прогресу або винахід нового. Характерні професії: інженер, механік, програміст, електрик, будівельник, конструктор.',
    m1_human: 'Діяльність, пов\'язана з вивченням та взаємодією з людьми, їх життям, лікуванням, навчанням, соціальною сферою, обслуговуванням, захистом та безпекою. Характерні професії: вчитель, лікар, психолог, соціальний працівник, менеджер.',
    m1_sign: 'Робота з цифрами, знаками, літерами, схемами, таблицями. Вивчення знакових систем: мови, цифри, формули та символи. Характерні професії: бухгалтер, перекладач, програміст, математик, редактор, архіваріус.',
    m1_art: 'Освоєння, опис, художнє зображення дійсності. Почуття прекрасного, створення гармонії, естетики, краси, збереження культурної спадщини. Характерні професії: художник, дизайнер, музикант, актор, архітектор, скульптор.',
  };

  const total = vectors.reduce((sum, v) => sum + (Number(scores[v.key]) || 0), 0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const segments = vectors.map((vec) => {
    const score = Number(scores[vec.key]) || 0;
    const percent = total > 0 ? (score / total) * 100 : 0;
    return { ...vec, score, percent };
  });

  // Calculate label positions
  let cAngle = 0;
  const labels = segments.map((seg) => {
    const segAngle = (seg.percent / 100) * 360;
    const mid = cAngle + segAngle / 2;
    const rad = (mid * Math.PI) / 180;
    const tx = 100 + radius * Math.cos(rad);
    const ty = 100 + radius * Math.sin(rad);
    cAngle += segAngle;
    return { ...seg, tx, ty, show: seg.percent >= 5 };
  });

  const analysis = recommendations?.module1_analysis;

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
          01
        </span>
        Професійна спрямованість
      </h2>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <p style={{ marginBottom: '12px', lineHeight: '1.6', fontSize: '13px' }}>
          <strong style={{ color: '#1e3a8a' }}>Професійний вектор взаємодії</strong> — це ключовий профорієнтаційний показник, який визначає, з чим саме людині природніше й ефективніше працювати у професійній діяльності.
        </p>
        <p style={{ marginBottom: '8px', fontSize: '13px', lineHeight: '1.6' }}>
          Методика базується на аналізі того, з яким типом об'єктів взаємодії людина:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '12px', lineHeight: '1.8', fontSize: '13px', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '8px' }}>швидше залучається в роботу,</li>
          <li style={{ marginBottom: '8px' }}>відчуває інтерес і енергію,</li>
          <li>демонструє вищу результативність.</li>
        </ul>
        <p style={{ lineHeight: '1.6', fontSize: '13px' }}>
          Визначення професійного вектора взаємодії допомагає звузити поле вибору галузей, уникнути випадкових рішень і обрати напрям навчання, який відповідає природним нахилам людини.
        </p>
      </div>

      {total > 0 ? (
        <>
          {/* Donut chart + legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '30px 0', gap: '40px' }}>
            <div style={{ flex: '0 0 300px' }}>
              <svg viewBox="0 0 200 200" style={{ width: '300px', height: '300px', transform: 'rotate(-90deg)' }}>
                {(() => {
                  let offset = 0;
                  return segments.map((seg) => {
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
                {labels.map((l) =>
                  l.show ? (
                    <text key={l.key} x={l.tx} y={l.ty} textAnchor="middle" dominantBaseline="middle"
                      style={{ fontSize: '10px', fontWeight: 'bold', fill: 'white', transform: 'rotate(90deg)', transformOrigin: `${l.tx}px ${l.ty}px`, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      {Math.round(l.percent)}%
                    </text>
                  ) : null
                )}
                <text x="100" y="95" textAnchor="middle" style={{ fontSize: '16px', fontWeight: 'bold', fill: '#2D3748', transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>Вектори</text>
                <text x="100" y="110" textAnchor="middle" style={{ fontSize: '14px', fill: '#4A5568', transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>взаємодії</text>
              </svg>
            </div>
            <div style={{ flex: '1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {segments.map((seg) => (
                  <div key={seg.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: seg.color, borderRadius: '3px', flexShrink: 0 }} />
                    <div style={{ flex: '1', minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seg.label}</div>
                      <div style={{ fontSize: '10px', color: '#718096' }}>{seg.score} балів ({Math.round(seg.percent)}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Type descriptions with levels */}
          <ul style={{ listStyleType: 'none', paddingLeft: '0', lineHeight: '1.8', marginBottom: '20px' }}>
            {[...segments].sort((a, b) => b.score - a.score).map((seg) => {
              const level = seg.score >= 6 ? 'високий' : seg.score <= 2 ? 'низький' : 'середній';
              return (
                <li key={seg.key} style={{ marginBottom: '10px', fontSize: '13px'}}>
                  <strong style={{ color: '#1e3a8a' }}>{seg.label}</strong> – показник <u>{level}</u>. {klimovDescriptions[seg.key]}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Недостатньо даних для побудови діаграми. Переконайтеся, що тестування пройдено повністю.</p>
      )}

    </section>
  );
}
