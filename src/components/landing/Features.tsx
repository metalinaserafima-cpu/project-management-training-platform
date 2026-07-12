import Icon from '@/components/ui/icon';

const features = [
  {
    icon: 'GraduationCap',
    title: 'Практические курсы',
    text: 'Agile, Scrum, Kanban и управление рисками — на реальных кейсах с интерактивными заданиями.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: 'Medal',
    title: 'Бейджи и достижения',
    text: 'Открывай награды за каждый пройденный этап и коллекционируй редкие бейджи.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: 'TrendingUp',
    title: 'Трекинг прогресса',
    text: 'Наглядная аналитика навыков, XP и серий занятий помогает не сбиться с курса.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: 'Users',
    title: 'Рейтинги и лиги',
    text: 'Соревнуйся с другими участниками, поднимайся в таблице лидеров и попадай в топ.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: 'KanbanSquare',
    title: 'Реальные проекты',
    text: 'Веди учебные проекты на доске задач и применяй знания сразу на практике.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: 'Sparkles',
    title: 'Персональный путь',
    text: 'Платформа подбирает следующий шаг под твой уровень и цели обучения.',
    color: 'from-fuchsia-500 to-indigo-600',
  },
];

const Features = () => (
  <section id="projects" className="py-24 relative">
    <div className="container">
      <div className="max-w-2xl mb-16">
        <span className="text-sm font-semibold text-gradient uppercase tracking-widest">Возможности</span>
        <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-3 leading-tight">
          Всё для роста в <span className="text-gradient">управлении проектами</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="group glass rounded-3xl p-7 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <Icon name={f.icon} size={26} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2.5">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
