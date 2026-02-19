import React from 'react';

interface Module4_6Props {
  scores: Record<string, any>;
}

export function Module4_6MotivationValues({ scores }: Module4_6Props) {
  // Module 4: Values (ranking 1-18)
  const valuesData = scores.m4_values || {};
  const veryImportant: [string, number][] = [];
  const moderatelyImportant: [string, number][] = [];
  const notImportant: [string, number][] = [];

  if (typeof valuesData === 'object' && Object.keys(valuesData).length > 0) {
    const entries = Object.entries(valuesData)
      .filter(([, v]) => typeof v === 'number')
      .sort(([, a], [, b]) => (a as number) - (b as number)) as [string, number][];

    entries.forEach(([key, rank]) => {
      if (rank >= 1 && rank <= 6) veryImportant.push([key, rank]);
      else if (rank >= 7 && rank <= 12) moderatelyImportant.push([key, rank]);
      else if (rank >= 13 && rank <= 18) notImportant.push([key, rank]);
    });
  }

  // Module 6: Motivation factors
  const strongMotivator = Number(scores.m6_strongMotivator) || 0;
  const moderate = Number(scores.m6_moderate) || 0;
  const weak = Number(scores.m6_weak) || 0;
  const demotivator = Number(scores.m6_demotivator) || 0;

  // Конкретные факторы
  const strongMotivatorsList = scores.m6_strongMotivatorsList || [];
  const moderateList = scores.m6_moderateList || [];
  const weakList = scores.m6_weakList || [];
  const demotivatorsList = scores.m6_demotivatorsList || [];

  const hasValues = veryImportant.length > 0 || moderatelyImportant.length > 0 || notImportant.length > 0;
  const hasMotivation = strongMotivator > 0 || moderate > 0 || weak > 0 || demotivator > 0;

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
          04
        </span>
        Мотивація та цінності
      </h2>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <p style={{ marginBottom: '12px', lineHeight: '1.6', fontSize: '13px' }}>
          <strong style={{ color: '#1e3a8a' }}>Мотивація та цінності</strong> - визначає, які життєві аспекти є найбільш важливими та показує конкретні фактори, які мотивують або демотивують абітурієнта.
        </p>
      </div>

      {/* Values section (Module 4) */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#1e3a8a', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Ціннісні категорії:</h3>
        <p style={{ marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          Результати показують, які аспекти життя є найбільш важливими для абітурієнта.
        </p>

        {!hasValues ? (
          <div style={{ padding: '20px', background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
            <p style={{ color: '#92400e', margin: 0 }}>
              ⚠️ Дані для модуля &quot;Ціннісні категорії&quot; відсутні. Переконайтеся, що користувач пройшов усі питання модуля 4.
            </p>
          </div>
        ) : (
          <>
            {/* Very important */}
            {veryImportant.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#e6fffa', borderRadius: '4px' }}>
                <h4 style={{ color: '#0f766e', marginBottom: '10px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Крайне важливі цінності</h4>
                <p style={{ color: '#134e4a', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                  Ці цінності визначають життєві пріоритети та керують основними рішеннями:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {veryImportant.map(([value, rank]) => (
                    <div key={value} style={{ background: 'white', border: '1px solid #a7f3d0', borderRadius: '4px', padding: '6px 12px', fontSize: '13px' }}>
                      <span style={{ color: '#0f766e' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderately important */}
            {moderatelyImportant.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#fef9c3', borderRadius: '4px' }}>
                <h4 style={{ color: '#a16207', marginBottom: '10px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Помірно важливі цінності</h4>
                <p style={{ color: '#713f12', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                  Значущі, але не першочергові аспекти:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {moderatelyImportant.map(([value, rank]) => (
                    <div key={value} style={{ background: 'white', border: '1px solid #fbbf24', borderRadius: '4px', padding: '6px 12px', fontSize: '13px' }}>
                      <span style={{ color: '#78350f' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not important */}
            {notImportant.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#fee2e2', borderRadius: '4px' }}>
                <h4 style={{ color: '#991b1b', marginBottom: '10px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Не важливі цінності</h4>
                <p style={{ color: '#7f1d1d', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                  Ці аспекти не мають суттєвого значення для прийняття рішень:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {notImportant.map(([value, rank]) => (
                    <div key={value} style={{ background: 'white', border: '1px solid #f87171', borderRadius: '4px', padding: '4px 10px', fontSize: '13px', color: '#991b1b' }}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Motivation section (Module 6) */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#1e3a8a', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Мотиваційні фактори:</h3>
        <p style={{ marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          Результати показують конкретні фактори, що мотивують або демотивують абітурієнта.
        </p>

        {!hasMotivation ? (
          <div style={{ padding: '20px', background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
            <p style={{ color: '#92400e', margin: 0 }}>
              ⚠️ Дані для модуля &quot;Мотиваційні фактори&quot; відсутні. Переконайтеся, що користувач пройшов усі питання модуля 6.
            </p>
          </div>
        ) : (
          <>
            {/* Strong motivators */}
            {strongMotivator > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#dbeafe', borderRadius: '4px' }}>
                <h4 style={{ color: '#1e40af', marginBottom: '10px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Сильні мотиватори</h4>
                <p style={{ color: '#1e3a8a', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                  Абсолютно відповідає ціннісним категоріям, максимально мотивує ({strongMotivator}% відповідей):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {strongMotivatorsList.map((item: any, index: number) => (
                    <div key={index} style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '6px 12px', fontSize: '13px' }}>
                      <span style={{ color: '#1e3a8a' }}>{item.factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderate motivators */}
            {moderate > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f0fdf4', borderRadius: '4px' }}>
                <h4 style={{ color: '#15803d', marginBottom: '10px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Помірні мотиватори</h4>
                <p style={{ color: '#166534', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                  Має певне мотиваційне значення ({moderate}% відповідей):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {moderateList.map((item: any, index: number) => (
                    <div key={index} style={{ background: 'white', border: '1px solid #86efac', borderRadius: '4px', padding: '6px 12px', fontSize: '13px' }}>
                      <span style={{ color: '#15803d' }}>{item.factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak motivators */}
            {weak > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
                <h4 style={{ color: '#6b7280', marginBottom: '10px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Слабкі мотиватори</h4>
                <p style={{ color: '#374151', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                  Майже не впливає на мотивацію ({weak}% відповідей):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {weakList.map((item: any, index: number) => (
                    <div key={index} style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', padding: '6px 12px', fontSize: '13px' }}>
                      <span style={{ color: '#6b7280' }}>{item.factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demotivators */}
            {demotivator > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#fef2f2', borderRadius: '4px' }}>
                <h4 style={{ color: '#b91c1c', marginBottom: '10px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Демотиватори</h4>
                <p style={{ color: '#991b1b', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                  Протирічить ціннісним категоріям, може викликати відторгнення ({demotivator}% відповідей):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {demotivatorsList.map((item: any, index: number) => (
                    <div key={index} style={{ background: 'white', border: '1px solid #fca5a5', borderRadius: '4px', padding: '6px 12px', fontSize: '13px' }}>
                      <span style={{ color: '#991b1b' }}>{item.factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Interpretation */}
      {(hasValues || hasMotivation) && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '25px', borderLeft: '4px solid #3B82F6' }}>
          <h4 style={{ color: '#1e3a8a', marginBottom: '15px', marginTop: 0, fontSize: '15px', fontWeight: 'bold' }}>Інтерпретація та рекомендації</h4>
          <div style={{ lineHeight: '1.6', fontSize: '13px' }}>
            <p style={{ marginBottom: '10px' }}>
              <strong>Ціннісний профіль:</strong>{' '}
              {veryImportant.length > 0
                ? <>Для абітурієнта найбільш важливими є: <strong style={{ color: '#1e3a8a' }}>{veryImportant.slice(0, 3).map(([v]) => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')}</strong>.</>
                : 'Недостатньо даних для аналізу.'}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Мотиваційний профіль:</strong>{' '}
              {strongMotivatorsList.length > 0 || demotivatorsList.length > 0 ? (
                <>
                  {strongMotivatorsList.length > 0 && (
                    <>Найбільше мотивує: <strong style={{ color: '#1e3a8a' }}>{strongMotivatorsList.slice(0, 3).map((item: any) => item.factor).join(', ')}</strong>. </>
                  )}
                  {demotivatorsList.length > 0 && (
                    <>Найбільше демотивує: <strong style={{ color: '#1e3a8a' }}>{demotivatorsList.slice(0, 3).map((item: any) => item.factor).join(', ')}</strong>.</>
                  )}
                </>
              ) : 'Недостатньо даних для аналізу.'}
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>Рекомендація:</strong> При виборі освітньої програми та майбутньої кар&apos;єри варто орієнтуватися на цінності топ-6 та враховувати сильні мотиватори. Уникати напрямків, які суперечать ключовим цінностям або містять демотиваційні фактори.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
