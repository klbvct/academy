import React from 'react';

interface Module7Props {
  scores: Record<string, number>;
}

export function Module7HollandRIASEC({ scores }: Module7Props) {
  const hollandTypes: Record<string, { letter: string; name: string; color: string; description: string }> = {
    realistic: {
      letter: 'R',
      name: 'Практик (Realistic)',
      color: '#10B981',
      description: 'Орієнтація на практичну діяльність, техніку, фізичну активність, конкретний результат. Професійні сфери: інженерія та технічні спеціальності, виробництво, будівництво, транспорт і логістика, аграрна сфера, технічне обслуговування.',
    },
    investigative: {
      letter: 'I',
      name: 'Дослідник (Investigative)',
      color: '#3B82F6',
      description: 'Аналітичне мислення, інтерес до науки, досліджень, закономірностей. Професійні сфери: наукові дослідження, IT та програмування, аналітика даних, медицина, фармацевтика, технологічні розробки.',
    },
    artistic: {
      letter: 'A',
      name: 'Творець (Artistic)',
      color: '#EC4899',
      description: 'Креативність, самовираження, нестандартність створення нового. Професійні сфери: дизайн, мистецтво, медіа та креативні індустрії, маркетинг і реклама, мода, культурні проекти.',
    },
    social: {
      letter: 'S',
      name: 'Помічник (Social)',
      color: '#F59E0B',
      description: 'Робота з людьми, підтримка, навчання, розвиток інших. Професійні сфери: освіта, психологія, соціальна робота, HR, медицина (соціальний аспект), коучинг і консультування.',
    },
    enterprising: {
      letter: 'E',
      name: 'Лідер (Enterprising)',
      color: '#EF4444',
      description: 'Ініціативність, вплив, управління, досягнення результатів. Професійні сфери: підприємництво, менеджмент, бізнес-адміністрування, продажі, політика, управління проектами.',
    },
    conventional: {
      letter: 'C',
      name: 'Організатор (Conventional)',
      color: '#8B5CF6',
      description: 'Структурність, порядок, системність, точність. Професійні сфери: фінанси та бухгалтерія, адміністративне управління, документообіг, логістика, банківська сфера, державна служба.',
    },
  };

  // Map score keys (m7_r,m7_i,m7_a,m7_s,m7_e,m7_c) to type keys
  const keyMap: Record<string, string> = {
    m7_r: 'realistic', m7_i: 'investigative', m7_a: 'artistic',
    m7_s: 'social', m7_e: 'enterprising', m7_c: 'conventional',
  };

  // Build sorted scores
  const typeKeys = Object.keys(hollandTypes);
  const hollandScores: { typeKey: string; score: number }[] = typeKeys.map((tk) => {
    const letter = hollandTypes[tk].letter.toLowerCase();
    const score = Number(scores[`m7_${letter}`]) || Number(scores[tk]) || 0;
    return { typeKey: tk, score };
  }).sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...hollandScores.map((h) => h.score), 1);
  const minScore = Math.min(...hollandScores.map((h) => h.score));

  // Top 3 for code
  const topThree = hollandScores.slice(0, 3);
  const hollandCode = topThree.map((t) => hollandTypes[t.typeKey].letter).join('');
  const topNames = topThree.map((t) => hollandTypes[t.typeKey].name.split(' ')[0]);

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
          06
        </span>
        Типологія професійних інтересів за Голландом
      </h2>
      
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <p style={{ marginBottom: '12px', lineHeight: '1.6', fontSize: '13px' }}>
          <strong style={{ color: '#1e3a8a' }}>Типологія професійних інтересів за Голландом</strong> — визначення домінуючого типу особистості за системою професійних інтересів Джона Голланда (RIASEC). Ваш професійний код складається з трьох найбільш виражених типів.
        </p>
      </div>

      {hollandScores.some((h) => h.score > 0) ? (
        <>
          {/* Dominant code display */}
          <div style={{
            padding: '25px', background: 'linear-gradient(135deg, #0c68f5 0%, #1e3a8a 100%)',
            borderRadius: '12px', margin: '25px 0', textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: 'white', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ваш професійний код
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', letterSpacing: '8px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {hollandCode}
            </div>
            <div style={{ fontSize: '13px', color: 'white', marginTop: '12px' }}>
              {topNames.join(' → ')}
            </div>
          </div>

          {/* Bar chart for each type */}
          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#1e3a8a' }}><strong>Розподіл типів професійних інтересів:</strong></h3>
          <div style={{ margin: '20px 0' }}>
            {hollandScores.map((item) => {
              const td = hollandTypes[item.typeKey];
              const percent = maxScore > minScore ? ((item.score - minScore) / (maxScore - minScore)) * 100 : 100;
              const level = percent >= 80 ? 'дуже високий' : percent >= 60 ? 'високий' : percent >= 40 ? 'середній' : percent >= 20 ? 'низький' : 'дуже низький';
              const isTop3 = topThree.some((t) => t.typeKey === item.typeKey);

              return (
                <div key={item.typeKey} style={{
                  marginBottom: '18px',
                  ...(isTop3 ? { padding: '12px', background: '#F0F9FF', borderRadius: '8px', borderLeft: `4px solid ${td.color}` } : {}),
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', background: td.color, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '18px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {td.letter}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{td.name}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.score} балів • {level} рівень</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: td.color }}>{Math.round(percent)}%</div>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: '#E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: `linear-gradient(90deg, ${td.color} 0%, ${td.color}dd 100%)` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Descriptions of dominant types */}
          <h3 style={{ marginTop: '35px', marginBottom: '15px', color: '#1e3a8a' }}><strong>Детальна характеристика домінуючих типів:</strong></h3>
          <ul style={{ lineHeight: '1.8' }}>
            {topThree.map((item) => {
              const td = hollandTypes[item.typeKey];
              return (
                <li key={item.typeKey} style={{ marginBottom: '10px', fontSize: '13px' }}>
                  <strong>{td.letter} – {td.name}</strong><br />
                  {td.description}
                </li>
              );
            })}
          </ul>

          {/* Code interpretation and Career recommendation */}
          <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
            <h4 style={{ color: '#1e3a8a', marginBottom: '15px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Інтерпретація та рекомендації</h4>
            <div style={{ lineHeight: '1.6', fontSize: '13px' }}>
              <p style={{ marginBottom: '5px' }}>
                <strong>Ваш професійний код {hollandCode}:</strong>
              </p>
              <p>
                Перша буква <strong style={{ color: '#1e3a8a' }}>({hollandCode[0]})</strong> вказує на найбільш виражений тип особистості — це ваша основна професійна орієнтація.
              </p>
              <p>
                Друга буква <strong style={{ color: '#1e3a8a' }}>({hollandCode[1]})</strong> показує додатковий тип, який доповнює основний.
              </p>
              <p style={{ marginBottom: '10px' }}>
                Третя буква <strong style={{ color: '#1e3a8a' }}>({hollandCode[2]})</strong> відображає ще один важливий аспект ваших професійних інтересів.
              </p>

              <p style={{ marginBottom: 0 }}>
                <strong>Рекомендація:</strong> При виборі професії шукайте ті сфери діяльності, які поєднують характеристики всіх трьох домінуючих типів вашого коду. 
                Це забезпечить найбільшу задоволеність від роботи та професійний успіх. 
                Звертайте увагу на професії, які дозволяють розвивати ваші природні схильності та інтереси.
              </p>
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Недостатньо даних для визначення типу за системою Голланда. Переконайтеся, що тестування пройдено повністю.</p>
      )}
    </section>
  );
}
