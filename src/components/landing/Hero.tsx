import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi, PublicLeader } from '@/lib/api';

const medalColor = (rank: number) =>
  rank === 0 ? 'text-amber-300 bg-amber-400/15' : rank === 1 ? 'text-slate-200 bg-slate-300/15' : 'text-orange-300 bg-orange-400/15';

const Hero = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { value: '0', label: 'учеников' },
    { value: '12', label: 'курсов' },
    { value: '0', label: 'завершённых проектов' },
  ]);
  const [leaders, setLeaders] = useState<PublicLeader[]>([]);

  useEffect(() => {
    statsApi
      .get()
      .then((data) => {
        setStats([
          { value: String(data.overview.students_count), label: 'учеников' },
          { value: String(data.overview.courses_count), label: 'курсов' },
          { value: String(data.overview.completed_projects), label: 'завершённых проектов' },
        ]);
        setLeaders(data.public_leaderboard || []);
      })
      .catch(() => {});
  }, [user]);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

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
              <div className="flex items-center gap-2 mb-5">
                <Icon name="Trophy" size={20} className="text-amber-300" />
                <h3 className="font-display font-bold text-base">Рейтинг студентов</h3>
              </div>

              {leaders.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Пока нет студентов в рейтинге
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-visible pr-1">
                  {leaders.map((l, i) => (
                    <div
                      key={l.user_id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-secondary/50 transition-all"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-xs shrink-0 ${
                        i < 3 ? medalColor(i) : 'bg-secondary text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${l.level.color} flex items-center justify-center shrink-0`}>
                        <Icon name={l.level.icon} size={16} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{l.full_name || l.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {l.level.label}{l.group_name && ` · гр. ${l.group_name}`}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-bold text-sm text-gradient">{l.completed_count}</div>
                        <div className="text-[10px] text-muted-foreground">курсов</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
