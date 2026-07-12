import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const categories = ['Все', 'Основы', 'Agile', 'Лидерство', 'Инструменты'];

const courses = [
  { cat: 'Основы', title: 'Введение в управление проектами', level: 'Новичок', lessons: 12, xp: 400, icon: 'BookOpen', color: 'from-violet-500 to-purple-600' },
  { cat: 'Agile', title: 'Scrum на практике', level: 'Средний', lessons: 18, xp: 650, icon: 'RefreshCw', color: 'from-pink-500 to-rose-600' },
  { cat: 'Agile', title: 'Kanban и поток задач', level: 'Средний', lessons: 14, xp: 520, icon: 'KanbanSquare', color: 'from-cyan-500 to-blue-600' },
  { cat: 'Лидерство', title: 'Управление командой', level: 'Продвинутый', lessons: 20, xp: 800, icon: 'Users', color: 'from-amber-500 to-orange-600' },
  { cat: 'Инструменты', title: 'Диаграммы Ганта и планирование', level: 'Средний', lessons: 10, xp: 380, icon: 'GanttChart', color: 'from-emerald-500 to-teal-600' },
  { cat: 'Лидерство', title: 'Управление рисками', level: 'Продвинутый', lessons: 16, xp: 700, icon: 'ShieldAlert', color: 'from-fuchsia-500 to-indigo-600' },
];

const Courses = () => {
  const [active, setActive] = useState('Все');
  const filtered = active === 'Все' ? courses : courses.filter((c) => c.cat === active);

  return (
    <section id="courses" className="py-24 relative">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-sm font-semibold text-gradient uppercase tracking-widest">Каталог</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-3 leading-tight">
              Курсы, которые <span className="text-gradient">качают навык</span>
            </h2>
          </div>
          <Button variant="outline" className="rounded-xl border-border bg-secondary/40 hover:bg-secondary">
            Все курсы
            <Icon name="ArrowRight" size={16} className="ml-1" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                active === c
                  ? 'bg-gradient-brand text-white glow'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.title}
              className="group glass rounded-3xl p-6 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon name={c.icon} size={24} className="text-white" />
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                  {c.level}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg mb-4 flex-1">{c.title}</h3>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                <span className="flex items-center gap-1.5">
                  <Icon name="PlayCircle" size={16} />
                  {c.lessons} уроков
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Icon name="Zap" size={16} />
                  +{c.xp} XP
                </span>
              </div>

              <Button className="w-full bg-secondary hover:bg-gradient-brand hover:text-white transition-all rounded-xl font-semibold">
                Начать курс
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;
