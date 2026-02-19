import React from 'react';

interface Module3Props {
  scores: Record<string, any>;
}

export function Module3ThinkingTypes({ scores }: Module3Props) {
  const thinkingTypes: Record<string, { name: string; color: string; description: string }> = {
    m3_artistic: {
      name: 'Художнє (наочно-образне)',
      color: '#F59E0B',
      description: 'Інструмент, який дозволяє нам конструювати в уяві неіснуючу реальність або перетворювати існуючу на щось нове. Створювати образи та оперування ними у процесі вирішення поставлених завдань — основна стратегія цього типу мислення. Розвинуто візуальне сприйняття та уяву.',
    },
    m3_theoretical: {
      name: 'Теоретичне',
      color: '#3B82F6',
      description: 'Дозволяє узагальнювати, порівнювати, аналізувати та класифікувати накопичені знання та уявлення, виражаючи у формі норм, правил, законів, концепцій, книг. Абстрактне, узагальнене відображення. Дозволяє знаходити причинно-наслідкові зв\'язки у явищах та предметах, шукати відповідь на запитання «чому?».',
    },
    m3_practical: {
      name: 'Практичне',
      color: '#10B981',
      description: 'Теорії перевіряються практично — схеми, креслення, проекти, плани перетворюють теоретичні поняття на реальну дійсність. Думка набуває фізичної форми. Характерно для людей, орієнтованих на результат, а не на процес.',
    },
    m3_creative: {
      name: 'Творче (продуктивне)',
      color: '#EC4899',
      description: 'Оригінальність ідей, нетривіальність, гнучкість. Пошук нових рішень для існуючих завдань чи проблемних ситуацій. Така людина завжди прагне знайти своє власне оригінальне рішення. Здатність продукувати нові ідеї в різних ситуаціях невизначеності на основі раніше відомої інформації.',
    },
    m3_convergent: {
      name: 'Конвергентне',
      color: '#8B5CF6',
      description: '«Бізнес-мислення» — система поглядів на світ і особливостей розумового процесу, базою до якого є твердження: «ми самі відтворюємо своє життя». Визначається вірою в можливість будувати власну реальність, адаптуватися до певних умов. Ключовими умовами виступають: самостійність, відповідальність, широта поглядів, дальнобачність, готовність до ризику, віра в себе.',
    },
    m3_intuitive: {
      name: 'Інтуїтивне',
      color: '#14B8A6',
      description: 'Це спосіб прийняття рішень, в якому результат виникає швидко й без явного логічного аналізу. Людина отримує відповідь на основі підсвідомого досвіду, емоцій або власних відчуттів, часто не усвідомлюючи, як саме вона до нього дійшла.',
    },
    m3_analytical: {
      name: 'Аналітичне',
      color: '#EF4444',
      description: 'Особливий тип абстрактного мислення, яке допомагає структурувати, конструювати і оперувати абстрактними поняттями. Стимулює здатність розкладувати великі завдання на дрібні складові, логічно переосмислюючи їх.',
    },
  };

  const keys = Object.keys(thinkingTypes);

  // Get raw scores - handle both flat scores and nested structure
  const rawScores: Record<string, number> = {};
  let total = 0;
  keys.forEach((key) => {
    let val = 0;
    if (typeof scores[key] === 'number') {
      val = scores[key];
    } else if (scores[key]?.percentageExample !== undefined) {
      val = Number(scores[key].percentageExample) || 0;
    }
    rawScores[key] = val;
    total += val;
  });

  // Calculate percentages and sort
  const sorted = keys
    .map((key) => ({
      key,
      ...thinkingTypes[key],
      value: rawScores[key],
      percent: total > 0 ? (rawScores[key] / total) * 100 : 0,
    }))
    .sort((a, b) => b.percent - a.percent);

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
          03
        </span>
        Домінуючі типи мислення
      </h2>
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <p style={{ marginBottom: '12px', lineHeight: '1.6', fontSize: '13px' }}>
          <strong style={{ color: '#1e3a8a' }}>Домінуючі типи мислення</strong> - у людини задіяна велика кількість типів мислення. У даному випадку ми говоримо про ті, які переважають.
        </p>
      </div>

      {total > 0 && sorted.length > 0 ? (
        <>
          {/* Horizontal bar chart */}
          <div style={{ margin: '20px 0' }}>
            {sorted.map((item) => (
              <div key={item.key} style={{ marginBottom: '10px', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.color }}>{Math.round(item.percent)}%</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: '#E5E7EB', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '12px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{item.value} балів</div>
              </div>
            ))}
          </div>

          {/* Descriptions */}
          <ul style={{ lineHeight: '1.8' }}>
            {sorted.map((item) => (
              <li key={item.key} style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong style={{ color: '#1e3a8a' }}>{item.name} мислення ({Math.round(item.percent)}%)</strong> — {item.description}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Недостатньо даних для побудови діаграми. Переконайтеся, що тестування пройдено повністю.</p>
      )}
    </section>
  );
}
