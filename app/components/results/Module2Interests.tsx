import React from 'react';

interface Module2Props {
  scores: Record<string, number>;
}

export function Module2Interests({ scores }: Module2Props) {
  const industries = [
    { key: 'm2_naturalScience', name: 'Природничі науки і Екологія', color: '#10B981' },
    { key: 'm2_engineering', name: 'Інженерія та технології', color: '#3B82F6' },
    { key: 'm2_robotics', name: 'Робототехніка, мехатроніка', color: '#8B5CF6' },
    { key: 'm2_physics', name: 'Фізика і астрофізика', color: '#06B6D4' },
    { key: 'm2_mathematics', name: 'Математика і статистика', color: '#F59E0B' },
    { key: 'm2_it', name: 'Інформаційні технології', color: '#6366F1' },
    { key: 'm2_business', name: 'Бізнес, менеджмент та економіка', color: '#EF4444' },
    { key: 'm2_humanities', name: 'Гуманітарні науки', color: '#14B8A6' },
    { key: 'm2_journalism', name: 'Журналістика, медіа та піар', color: '#EC4899' },
    { key: 'm2_social', name: 'Соціальні науки', color: '#F97316' },
    { key: 'm2_creative', name: 'Креативні індустрії та дизайн', color: '#84CC16' },
    { key: 'm2_education', name: 'Освіта та педагогіка', color: '#22C55E' },
    { key: 'm2_law', name: 'Право та державне управління', color: '#10B981' },
    { key: 'm2_medicine', name: 'Медицина та здоров\'я', color: '#EC4899' },
    { key: 'm2_art', name: 'Мистецтво та аудіовізуальне мистецтво', color: '#F59E0B' },
    { key: 'm2_hospitality', name: 'Готельно-ресторанна справа та туризм', color: '#3B82F6' },
    { key: 'm2_agriculture', name: 'Аграрні науки та FoodTech', color: '#22C55E' },
    { key: 'm2_construction', name: 'Будівництво та архітектура', color: '#8B5CF6' },
    { key: 'm2_transport', name: 'Транспортні технології й логістика', color: '#EF4444' },
    { key: 'm2_sports', name: 'Спорт, тренерство та реабілітація', color: '#06B6D4' },
  ];

  // Calculate percentages and levels
  const industryScores = industries.map((ind) => {
    const percent = Number(scores[ind.key]) || 0;
    let level = '--';
    let levelText = 'зовсім не цікавить';
    if (percent >= 75) { level = '++'; levelText = 'дуже цікавить'; }
    else if (percent >= 50) { level = '+'; levelText = 'цікавить'; }
    else if (percent >= 30) { level = '0'; levelText = 'нейтрально'; }
    else if (percent >= 15) { level = '-'; levelText = 'не цікавить'; }
    return { ...ind, percent, level, levelText, score: Math.max(1, percent) };
  }).sort((a, b) => b.percent - a.percent);

  const totalScore = industryScores.reduce((sum, i) => sum + i.score, 0);

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
          02
        </span>
        Індивідуальні інтереси і здібності в навчанні
      </h2>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <p style={{ marginBottom: '12px', lineHeight: '1.6', fontSize: '13px' }}>
          <strong style={{ color: '#1e3a8a' }}>Модуль спрямований на розуміння поточних інтересів та визначення шкали здібностей абітурієнта.</strong> Вивчення профільного інтересу є важливим кроком у виборі вищої освіти, оскільки допомагає зрозуміти, які галузі знань найбільш привабливі та цікаві для особи.
        </p>
        <p style={{ marginBottom: '8px', fontSize: '13px', lineHeight: '1.6' }}>
          Тест охоплює 20 основних професійних сфер:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '12px', lineHeight: '1.8', fontSize: '13px', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '8px' }}>природничі науки, інженерія та технології;​</li>
          <li style={{ marginBottom: '8px' }}>IT, робототехніка, фізика та математика;​</li>
          <li style={{ marginBottom: '8px' }}>гуманітарні науки, журналістика, креативні індустрії;​</li>
          <li>медицина, право, освіта, спорт та інші спеціалізації.​</li>
        </ul>
        <p style={{ lineHeight: '1.6', fontSize: '13px' }}>
          Висока оцінка у конкретній сфері свідчить про розвинені здібності та стійкий інтерес до цієї області діяльності, що сприяє більш свідомому вибору освітнього напрямку.
        </p>
      </div>

      {/* Treemap visualization */}
      <div style={{
        width: '100%', border: '2px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden',
        background: '#F9FAFB', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', marginBottom: '20px'
      }}>
        {industryScores.map((ind) => {
          const width = Math.sqrt((ind.score / totalScore) * 100) * 10;
          const minWidth = 120;
          const calculatedWidth = Math.max(minWidth, width);
          const opacity = Math.max(0.5, ind.percent / 100);
          return (
            <div key={ind.key} style={{
              width: `${calculatedWidth}px`, flexGrow: ind.score, minHeight: '100px',
              background: ind.color, opacity, border: '2px solid white', padding: '12px',
              boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', position: 'relative', overflow: 'hidden'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'white', fontSize: '12px', lineHeight: '1.2', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                  {ind.name}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.9)', color: ind.color, display: 'inline-block', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', marginTop: '6px' }}>
                  {Math.round(ind.percent)}%
                </div>
              </div>
              <div style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', opacity: 0.95 }}>{ind.levelText}</div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: '20px', fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
        <em>Розмір блоку відповідає інтенсивності прояву інтересу. Більший блок означає вищий рівень інтересу та розвинених здібностей у цій сфері.</em>
      </p>

      <p style={{ marginTop: '20px', lineHeight: '1.6', fontSize: '13px' }}>
        Не всі навички, здобуті в школі, легко перетворюються на професійні компетенції бакалаврату. Тут важливо розуміти різницю між <strong style={{ color: '#1e3a8a' }}>трансферними вміннями</strong> (наприклад, комунікація, розуміння предмету, тощо) і спеціалізованими знаннями, які здебільшого здобуваються лише у ВИШі.
      </p>
    </section>
  );
}
