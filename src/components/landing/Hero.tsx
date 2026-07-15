import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi, MyStats } from '@/lib/api';

const Hero = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { value: '0', label: 'учеников' },
    { value: '12', label: 'курсов' },
    { value: '0', label: 'завершённых проектов' },
  ]);
  const [me, setMe] = useState<MyStats | null>(null);

  useEffect(() => {
    statsApi
      .get()
      .then((data) => {
        setStats([
          { value: String(data.overview.students_count), label: 'учеников' },
          { value: String(data.overview.courses_count), label: 'курсов' },
          { value: String(data.overview.completed_projects), label: 'завершённых проектов' },
        ]);
        setMe(data.me);
      })
      .catch(() => {});
  }, [user]);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  const displayName = user ? (user.full_name || user.name) : 'Анна Ветрова';
  const displayGroup = user ? (user.group_name || 'Группа не указана') : 'Project Manager';
  const initial = displayName.charAt(0).toUpperCase();
  const completedCount = me?.total_completed_count ?? 9;
  const totalCourses = 12;
  const progressPercent = Math.round((completedCount / totalCourses) * 100);

  return (
    <section id="hero" className="relative overflow-hidden pt-40 pb-24 grid-bg">
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px] animate-blob" />
      <div className="absolute top-40 -right-20 w-[460px] h-[460px] rounded-full bg-accent/25 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[120px] animate-blob" style={{ animationDelay: '8s' }} />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
              Прокачай навык
              <br />
              <span className="text-gradient">управления проектами</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mb-9 leading-relaxed">
              Проходи практические курсы, зарабатывай XP и бейджи, соревнуйся в рейтинге и веди реальные проекты — всё в одном месте.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Button
                size="lg"
                onClick={() => scrollTo('#courses')}
                className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl h-13 px-7 text-base glow"
              >
                Начать обучение
                <Icon name="ArrowRight" size={18} className="ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo('#progress')}
                className="rounded-xl h-13 px-7 text-base border-border bg-secondary/40 hover:bg-secondary"
              >
                <Icon name="Play" size={18} className="mr-1" />
                Как это работает
              </Button>
            </div>

            <div className="flex gap-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display font-extrabold text-3xl text-gradient">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="glass rounded-3xl p-6 glow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center font-display font-bold text-lg">
                    {initial}
                  </div>
                  <div>
                    <div className="font-semibold">{displayName}</div>
                    <div className="text-xs text-muted-foreground">{displayGroup}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-300 text-sm font-semibold">
                  <Icon name="Flame" size={15} />
                  14
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Прогресс по курсам</span>
                  <span className="font-semibold">{completedCount} / {totalCourses} курсов</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: 'Trophy', label: 'Топ-3', color: 'text-amber-300 bg-amber-400/15' },
                  { icon: 'Target', label: 'Спринтер', color: 'text-cyan-300 bg-cyan-400/15' },
                  { icon: 'Rocket', label: 'Старт', color: 'text-fuchsia-300 bg-fuchsia-400/15' },
                ].map((b) => (
                  <div key={b.label} className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 ${b.color}`}>
                    <Icon name={b.icon} size={22} />
                    <span className="text-xs font-medium">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-6 -right-4 glass rounded-2xl px-4 py-3 flex items-center gap-2 animate-float">
              <Icon name="Award" size={20} className="text-cyan-300" />
              <span className="text-sm font-semibold">Задание принято</span>
            </div>
            <div className="absolute -bottom-5 -left-4 glass rounded-2xl px-4 py-3 flex items-center gap-2 animate-float" style={{ animationDelay: '2s' }}>
              <Icon name="CheckCircle2" size={20} className="text-emerald-300" />
              <span className="text-sm font-semibold">Задача закрыта</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
