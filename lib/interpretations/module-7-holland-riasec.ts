// Module 7: Holland Theory (RIASEC)
export const Module7HollandRIASEC = {
  id: 'module7',
  name: 'Теорія Голланда (RIASEC)',
  description: 'Виявлення типу особистості та відповідних професійних орієнтацій за моделлю Джона Голланда',
  totalQuestions: 37,
  scoringKeys: {
    1: 'realistic', 2: 'investigative', 3: 'artistic', 4: 'social',
    5: 'enterprising', 6: 'conventional', 7: 'realistic', 8: 'investigative',
    9: 'artistic', 10: 'social', 11: 'enterprising', 12: 'conventional',
    13: 'realistic', 14: 'investigative', 15: 'artistic', 16: 'social',
    17: 'enterprising', 18: 'conventional', 19: 'realistic', 20: 'investigative',
    21: 'artistic', 22: 'social', 23: 'enterprising', 24: 'conventional',
    25: 'realistic', 26: 'investigative', 27: 'artistic', 28: 'social',
    29: 'enterprising', 30: 'conventional', 31: 'realistic', 32: 'investigative',
    33: 'artistic', 34: 'social', 35: 'enterprising', 36: 'conventional', 37: 'realistic',
  } as const,
  types: {
    realistic: {
      letter: 'R',
      name: 'Практик',
      description: 'Орієнтація на практичну діяльність, техніку, фізичну активність, конкретний результат.',
      careers: ['інженерія та технічні спеціальності', 'виробництво', 'будівництво', 'транспорт і логістика', 'аграрна сфера', 'технічне обслуговування'],
    },
    investigative: {
      letter: 'I',
      name: 'Дослідник / Мислитель',
      description: 'Аналітичне мислення, інтерес до науки, досліджень, закономірностей.',
      careers: ['наукові дослідження', 'IT та програмування', 'аналітика даних', 'медицина', 'фармацевтика', 'технологічні розробки'],
    },
    artistic: {
      letter: 'A',
      name: 'Творець',
      description: 'Креативність, самовираження, нестандартність створення нового.',
      careers: ['дизайн', 'мистецтво', 'медіа та креативні індустрії', 'маркетинг і реклама', 'мода', 'культурні проекти'],
    },
    social: {
      letter: 'S',
      name: 'Помічник',
      description: 'Робота з людьми, підтримка, навчання, розвиток інших.',
      careers: ['освіта', 'психологія', 'соціальна робота', 'HR', 'медицина (соціальний аспект)', 'коучинг і консультування'],
    },
    enterprising: {
      letter: 'E',
      name: 'Лідер',
      description: 'Ініціативність, вплив, управління, досягнення результатів.',
      careers: ['підприємництво', 'менеджмент', 'бізнес-адміністрування', 'продажі', 'політика', 'управління проектами'],
    },
    conventional: {
      letter: 'C',
      name: 'Організатор',
      description: 'Структурність, порядок, системність, точність.',
      careers: ['фінанси та бухгалтерія', 'адміністративне управління', 'документообіг', 'логістика', 'банківська сфера', 'державна служба'],
    },
  },
} as const
