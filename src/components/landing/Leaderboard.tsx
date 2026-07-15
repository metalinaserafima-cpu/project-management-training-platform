import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi, MyStats, WeeklyLeader } from '@/lib/api';

const medalColor = (rank: number) =>
  rank === 1 ? 'text-amber-300 bg-amber-400/15' : rank === 2 ? 'text-slate-200 bg-slate-300/15' : 'text-orange-300 bg-orange-400/15';

const Leaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<WeeklyLeader[]>([]);
  const [me, setMe] = useState<MyStats | null>(null);

  useEffect(() => {
    statsApi
      .get()
      .then((data) => {
        setLeaders(data.weekly_leaderboard || []);
        setMe(data.me);
      })
      .catch(() => {});
  }, [user]);

  const badgesEarned = me ? Object.values(me.badges).filter(Boolean).length : 0;

  return (
    <section id="profile" className="py-24 relative">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <span className="text-sm font-semibold text-gradient uppercase tracking-widest">Соревнование</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-3 leading-tight mb-5">
              Рейтинг <span className="text-gradient">лидеров</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Выполняй задания по курсам, поднимайся в таблице и борись за место в топе недели. Лучшие получают эксклюзивные бейджи.
            </p>

            {user ? (
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center font-display font-bold text-xl glow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Твой профиль</div>
                    <div className="text-sm text-muted-foreground">{user.name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: 'Trophy', v: me?.weekly_rank ? `#${me.weekly_rank}` : '—', l: 'место в неделе' },
                    { icon: 'CheckCircle2', v: String(me?.total_completed_count ?? 0), l: 'курсов пройдено' },
                    { icon: 'Medal', v: String(badgesEarned), l: 'бейджей' },
                  ].map((x) => (
                    <div key={x.l} className="rounded-2xl bg-secondary/60 p-3 text-center">
                      <Icon name={x.icon} size={18} className="mx-auto mb-1 text-primary" />
                      <div className="font-display font-bold">{x.v}</div>
                      <div className="text-[11px] text-muted-foreground">{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass rounded-3xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Войдите в аккаунт, чтобы увидеть свой профиль и место в рейтинге</p>
                <Button onClick={() => navigate('/auth')} className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl">
                  Войти
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 glass rounded-3xl p-4 md:p-6">
            <div className="flex items-center justify-between px-3 mb-4">
              <h3 className="font-display font-bold text-lg">Топ недели</h3>
            </div>
            {leaders.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                На этой неделе ещё никто не завершил ни одного задания
              </div>
            ) : (
              <div className="space-y-2">
                {leaders.map((u, i) => {
                  const rank = i + 1;
                  const isMe = me?.user_id === u.user_id;
                  return (
                    <div
                      key={u.user_id}
                      className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${
                        isMe ? 'bg-gradient-brand/10 border border-primary/30' : 'hover:bg-secondary/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                        rank <= 3 ? medalColor(rank) : 'bg-secondary text-muted-foreground'
                      }`}>
                        {rank}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center font-display font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate flex items-center gap-2">
                          {u.name}
                          {isMe && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">вы</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {u.avg_hours !== null ? `в среднем ${u.avg_hours} ч на задание` : 'задания в процессе проверки'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-bold text-gradient">{u.completed_count}</div>
                        <div className="text-[11px] text-muted-foreground">заданий</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
