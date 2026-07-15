import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi, CourseProgress } from '@/lib/api';
import { courses } from '@/data/course';

interface BadgeDef {
  key: keyof BadgesState;
  icon: string;
  title: string;
  desc: string;
  color: string;
}

interface BadgesState {
  first_start: boolean;
  on_streak: boolean;
  sprinter: boolean;
  champion: boolean;
  strategist: boolean;
}

const badgeDefs: BadgeDef[] = [
  { key: 'first_start', icon: 'Rocket', title: 'Первый старт', desc: 'Начал первый курс', color: 'from-fuchsia-500 to-pink-600' },
  { key: 'on_streak', icon: 'Flame', title: 'На потоке', desc: 'Активность на этой неделе', color: 'from-orange-500 to-red-600' },
  { key: 'sprinter', icon: 'Target', title: 'Спринтер', desc: 'Закрыл 10 заданий по проекту', color: 'from-cyan-500 to-blue-600' },
  { key: 'champion', icon: 'Trophy', title: 'Чемпион', desc: 'Топ-3 в рейтинге недели', color: 'from-amber-500 to-yellow-600' },
  { key: 'strategist', icon: 'BrainCircuit', title: 'Стратег', desc: 'Прошёл все 12 курсов', color: 'from-violet-500 to-purple-600' },
];

const defaultBadges: BadgesState = {
  first_start: false,
  on_streak: false,
  sprinter: false,
  champion: false,
  strategist: false,
};

const Progress = () => {
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgress>>({});
  const [completedCount, setCompletedCount] = useState(0);
  const [badges, setBadges] = useState<BadgesState>(defaultBadges);

  useEffect(() => {
    if (!user) return;
    statsApi
      .get()
      .then((data) => {
        if (!data.me) return;
        const map: Record<string, CourseProgress> = {};
        data.me.courses.forEach((c) => {
          map[c.task_key] = c;
        });
        setCourseProgress(map);
        setCompletedCount(data.me.total_completed_count);
        setBadges(data.me.badges);
      })
      .catch(() => {});
  }, [user]);

  return (
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
            {user ? (
              <div className="space-y-6 max-h-[380px] overflow-y-auto scrollbar-visible pr-2">
                {courses.map((c) => {
                  const progress = courseProgress[c.id]?.progress_percent ?? 0;
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between text-sm mb-2 gap-3">
                        <span className="font-medium truncate">{c.title}</span>
                        <span className="text-muted-foreground shrink-0">{progress}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Войдите в аккаунт, чтобы видеть свой прогресс по курсам</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
              {[
                { v: String(completedCount), l: 'курсов пройдено' },
                { v: String(courses.length), l: 'всего курсов' },
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
              {badgeDefs.map((b) => {
                const earned = badges[b.key];
                return (
                  <div
                    key={b.title}
                    className={`rounded-2xl p-4 text-center transition-all ${
                      earned ? 'bg-secondary/60 hover:-translate-y-1' : 'bg-secondary/20 opacity-50'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-2 ${!earned && 'grayscale'}`}>
                      <Icon name={earned ? b.icon : 'Lock'} size={22} className="text-white" />
                    </div>
                    <div className="text-sm font-semibold leading-tight">{b.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{b.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Progress;
