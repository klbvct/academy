// Barrel export for all interpreter modules
export { Module1ProfessionalVector } from './module-1-professional-vector';
export { Module2Interests } from './module-2-interests';
export { Module3ThinkingTypes } from './module-3-thinking-types';
export { Module4ValueCategories } from './module-4-value-categories';
export { Module5IntellectualLability } from './module-5-intellectual-lability';
export { Module6Motivation } from './module-6-motivation';
export { Module7HollandRIASEC } from './module-7-holland-riasec';
export { Module8PerceptionTypes } from './module-8-perception-types';

// Array of all modules for easy iteration
export const interpreters = [
  'Module1ProfessionalVector',
  'Module2Interests',
  'Module3ThinkingTypes',
  'Module4ValueCategories',
  'Module5IntellectualLability',
  'Module6Motivation',
  'Module7HollandRIASEC',
  'Module8PerceptionTypes',
] as const;
