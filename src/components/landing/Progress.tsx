import Icon from '@/components/ui/icon';

const badges = [
  { icon: 'Rocket', title: 'Первый старт', desc: 'Начал первый курс', color: 'from-fuchsia-500 to-pink-600', earned: true },
  { icon: 'Flame', title: 'На потоке', desc: 'Серия 7 дней подряд', color: 'from-orange-500 to-red-600', earned: true },
  { icon: 'Target', title: 'Спринтер', desc: 'Закрыл 50 задач', color: 'from-cyan-500 to-blue-600', earned: true },
  { icon: 'Trophy', title: 'Чемпион', desc: 'Топ-3 в рейтинге', color: 'from-amber-500 to-yellow-600', earned: true },
  { icon: 'BrainCircuit', title: 'Стратег', desc: 'Прошёл 10 курсов', color: 'from-violet-500 to-purple-600', earned: false },
  { icon: 'Crown', title: 'Мастер PM', desc: 'Достиг 20 уровня', color: 'from-emerald-500 to-teal-600', earned: false },
];

const skills = [
  { name: 'Планирование', value: 82 },
  { name: 'Agile / Scrum', value: 74 },
  { name: 'Управление рисками', value: 61 },
  { name: 'Лидерство', value: 68 },
];

const Progress = () => (
  <section id="progress" className="py-24 relative overflow-hidden">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/15 blur-[130px]" />
    <div className="container relative">
      <div className="max-w-2xl mb-16">
        <span className="text-sm font-semibold text-gradient uppercase tracking-widest">Прогресс</span>
        <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-3 leading-tight">
          Отслеживай рост и <span className="text-gradient">собирай награды</span>
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-7">
            <Icon name="Radar" size={22} className="text-primary" />
            <h3 className="font-display font-bold text-xl">Твои навыки</h3>
          </div>
          <div className="space-y-6">
            {skills.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            {[
              { v: '12', l: 'уровень' },
              { v: '48', l: 'курсов' },
              { v: '14', l: 'дней стрик' },
            ].map((x) => (
              <div key={x.l} className="text-center">
                <div className="font-display font-extrabold text-2xl text-gradient">{x.v}</div>
                <div className="text-xs text-muted-foreground">{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-7">
            <Icon name="Medal" size={22} className="text-accent" />
            <h3 className="font-display font-bold text-xl">Коллекция бейджей</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.title}
                className={`rounded-2xl p-4 text-center transition-all ${
                  b.earned ? 'bg-secondary/60 hover:-translate-y-1' : 'bg-secondary/20 opacity-50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-2 ${!b.earned && 'grayscale'}`}>
                  <Icon name={b.earned ? b.icon : 'Lock'} size={22} className="text-white" />
                </div>
                <div className="text-sm font-semibold leading-tight">{b.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Progress;
