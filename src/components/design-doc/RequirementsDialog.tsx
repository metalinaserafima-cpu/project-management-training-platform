import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const adaptationRows = [
  {
    type: 'Строительство / инфраструктура',
    items: ['Инженерные изыскания', 'Смета и бюджет с разбивкой по материалам', 'Разрешительная документация (экспертизы, согласования)', 'График поставок и логистика'],
  },
  {
    type: 'Маркетинговая кампания',
    items: ['Медиаплан (каналы, бюджет, охваты)', 'Креативные концепты и макеты рекламы', 'A/B-тесты, метрики эффективности (ROI, CAC, конверсии)', 'Таймлайн публикаций'],
  },
  {
    type: 'Событие (фестиваль, конференция)',
    items: ['Детальная программа с временными слотами', 'Схема площадки, зонирование, маршруты', 'План безопасности и действия при ЧС', 'Работа волонтёров, подрядчиков, спонсоров'],
  },
  {
    type: 'Социальный / образовательный проект',
    items: ['Педагогические или социальные методики', 'Критерии оценки воздействия (не только количественные)', 'Долгосрочная устойчивость, партнёрские программы'],
  },
  {
    type: 'Производство продукта (физического)',
    items: ['Спецификация материалов и компонентов', 'Технологическая карта (последовательность операций)', 'Контроль качества на каждом этапе (ОТК)', 'Логистика, складирование, упаковка'],
  },
  {
    type: 'ИТ-проект (веб/мобильное приложение, облачный сервис, корпоративная система)',
    items: [
      'Архитектура ПО — микросервисы, монолит, событийно-ориентированная; диаграммы компонентов и взаимодействий',
      'Модель данных — структуры БД (SQL/NoSQL), схемы API (REST/gRPC/GraphQL)',
      'Технологический стек — языки, фреймворки, инфраструктура',
      'Требования к производительности — SLA, масштабирование, кэширование',
      'Безопасность — аутентификация, авторизация, шифрование, защита от атак (OWASP)',
      'DevOps и CI/CD — пайплайны развёртывания, мониторинг, логирование',
      'Стратегия тестирования — модульные, интеграционные, нагрузочные тесты',
      'Документация для разработчиков и пользователей',
    ],
  },
];

const criteriaRows = [
  { name: 'Полнота структуры', weight: '25%', desc: 'Наличие всех обязательных разделов' },
  { name: 'Глубина проработки', weight: '20%', desc: 'Детализация требований и решений, обоснованность выбора архитектуры' },
  { name: 'Логика и связность', weight: '15%', desc: 'Последовательное изложение от общего к частному' },
  { name: 'Профессиональное оформление', weight: '15%', desc: 'Соответствие требованиям к типографике, структуре, визуальным элементам' },
  { name: 'Наличие визуализаций', weight: '10%', desc: 'Диаграммы, схемы, макеты интерфейсов' },
  { name: 'Ясность и лаконичность', weight: '10%', desc: 'Отсутствие избыточной детализации, понятный язык' },
  { name: 'Версионирование', weight: '5%', desc: 'Наличие списка изменений, корректная версионность' },
];

const formattingRules = [
  'Система заголовков: иерархическая нумерация (1.0, 1.1, 1.1.1)',
  'Типографика: не более 2–3 шрифтов, чёткая иерархия текста',
  'Основной текст: размер 10–12pt, интерлиньяж 120–140%',
  'Выравнивание: по левому краю для основного текста',
  'Визуальные элементы: диаграммы, таблицы, графики в едином стиле',
  'Колонтитулы: название документа, номер страницы, версия',
];

const recommendations = [
  'Начинайте с целей и требований — это фундамент всего документа',
  'Используйте готовые шаблоны как основу, адаптируя их под свой проект',
  'Двигайтесь от общего к частному — сначала высокоуровневая архитектура, затем детали',
  'Визуализируйте сложные концепции — одна хорошая диаграмма может заменить тысячу слов',
  'Пишите кратко и понятно — избегайте длинных и сложных предложений',
  'Не перегружайте документ — фокусируйтесь на значимых аспектах',
  'Помните, что дизайн-документ — живой артефакт, который будет эволюционировать вместе с проектом',
];

const RequirementsDialog = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto overflow-x-hidden bg-card border-border rounded-3xl min-w-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 font-display text-xl">
            <Icon name="BookOpenCheck" size={22} className="text-primary" />
            Требования к оформлению дизайн-документа
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-2 text-sm leading-relaxed">
          <section>
            <p className="text-muted-foreground">
              Документ должен представлять собой связный, структурированный текст объёмом <b className="text-foreground">10–20 страниц</b>, оформленный в соответствии с профессиональными стандартами. Можно использовать результаты выполненных практических заданий.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <Icon name="Type" size={16} className="text-primary" />
              Требования к оформлению
            </h3>
            <ul className="space-y-2">
              {formattingRules.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-muted-foreground">
                  <Icon name="Check" size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <Icon name="Layers" size={16} className="text-primary" />
              Как адаптировать структуру под тип проекта
            </h3>
            <div className="space-y-3">
              {adaptationRows.map((row) => (
                <div key={row.type} className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <div className="font-display font-semibold text-sm mb-2 text-gradient">{row.type}</div>
                  <ul className="space-y-1.5">
                    {row.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Icon name="Dot" size={14} className="text-primary shrink-0 -mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <Icon name="Award" size={16} className="text-primary" />
              Критерии оценки
            </h3>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="text-left font-display font-semibold px-3 py-2.5">Критерий</th>
                    <th className="text-left font-display font-semibold px-3 py-2.5 w-16">Вес</th>
                    <th className="text-left font-display font-semibold px-3 py-2.5">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {criteriaRows.map((c) => (
                    <tr key={c.name} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 font-medium">{c.name}</td>
                      <td className="px-3 py-2.5 text-primary font-display font-semibold">{c.weight}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <Icon name="Lightbulb" size={16} className="text-primary" />
              Рекомендации по выполнению
            </h3>
            <ul className="space-y-2">
              {recommendations.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-muted-foreground">
                  <Icon name="ArrowRight" size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequirementsDialog;
