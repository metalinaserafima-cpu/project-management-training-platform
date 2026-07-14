export interface DesignDocSection {
  key: string;
  number: number;
  title: string;
  icon: string;
  hint: string;
}

export const designDocSections: DesignDocSection[] = [
  { key: 'title_page', number: 1, title: 'Титульная страница', icon: 'FileText', hint: 'Название проекта, автор, дата, тип проекта' },
  { key: 'toc', number: 2, title: 'Оглавление', icon: 'ListTree', hint: 'Формируется автоматически при экспорте в Word' },
  { key: 'concept', number: 3, title: 'Концепция и цели проекта', icon: 'Target', hint: 'Зачем нужен проект, какие цели он преследует' },
  { key: 'description', number: 4, title: 'Описание проекта', icon: 'FileSignature', hint: 'Общее описание того, что представляет собой проект' },
  { key: 'requirements', number: 5, title: 'Требования к проекту', icon: 'ListChecks', hint: 'Функциональные и нефункциональные требования' },
  { key: 'architecture', number: 6, title: 'Проектное решение (архитектура)', icon: 'Building2', hint: 'Как устроено решение, из каких частей состоит' },
  { key: 'alternatives', number: 7, title: 'Обзор альтернативных решений', icon: 'GitCompare', hint: 'Какие варианты рассматривались и почему выбран этот' },
  { key: 'appearance', number: 8, title: 'Внешний вид / взаимодействие', icon: 'Eye', hint: 'Как выглядит и как с ним взаимодействуют пользователи' },
  { key: 'roadmap', number: 9, title: 'План реализации (дорожная карта)', icon: 'Map', hint: 'Этапы и сроки реализации проекта' },
  { key: 'quality', number: 10, title: 'Стратегия контроля качества и приёмки', icon: 'ShieldCheck', hint: 'Как будет проверяться качество и приниматься результат' },
  { key: 'risks', number: 11, title: 'Управление рисками', icon: 'AlertTriangle', hint: 'Возможные риски проекта и меры по их снижению' },
  { key: 'changelog', number: 12, title: 'Список изменений', icon: 'History', hint: 'История изменений документа' },
  { key: 'glossary', number: 13, title: 'Глоссарий и сокращения', icon: 'BookOpenText', hint: 'Термины и сокращения, используемые в документе' },
];

export type ProjectType = 'construction' | 'marketing' | 'event' | 'production' | 'social' | 'other';

export const projectTypeLabels: Record<ProjectType, string> = {
  construction: 'Строительство',
  marketing: 'Маркетинг',
  event: 'Событие',
  production: 'Производство',
  social: 'Социальный проект',
  other: 'Другое',
};

export const projectTypeOptions = Object.entries(projectTypeLabels).map(([value, label]) => ({ value: value as ProjectType, label }));

export type DesignDocStatus = 'in_progress' | 'submitted' | 'accepted' | 'needs_revision';

export const designDocStatusMeta: Record<DesignDocStatus, { label: string; color: string; icon: string }> = {
  in_progress: { label: 'Черновик', color: 'text-amber-300 bg-amber-400/15', icon: 'Pencil' },
  submitted: { label: 'На проверке', color: 'text-cyan-300 bg-cyan-400/15', icon: 'Send' },
  accepted: { label: 'Принят', color: 'text-emerald-300 bg-emerald-400/15', icon: 'CheckCheck' },
  needs_revision: { label: 'На доработке', color: 'text-orange-300 bg-orange-400/15', icon: 'RotateCcw' },
};
