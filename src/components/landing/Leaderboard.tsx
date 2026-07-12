import Icon from '@/components/ui/icon';

const leaders = [
  { rank: 1, name: 'Максим Орлов', role: 'Senior PM', xp: 18420, level: 24, letter: 'М', me: false },
  { rank: 2, name: 'Ирина Соколова', role: 'Product Lead', xp: 16980, level: 22, letter: 'И', me: false },
  { rank: 3, name: 'Анна Ветрова', role: 'Project Manager', xp: 15340, level: 21, letter: 'А', me: true },
  { rank: 4, name: 'Дмитрий Белов', role: 'Scrum Master', xp: 14110, level: 19, letter: 'Д', me: false },
  { rank: 5, name: 'Ольга Зайцева', role: 'Team Lead', xp: 12760, level: 18, letter: 'О', me: false },
];

const medalColor = (rank: number) =>
  rank === 1 ? 'text-amber-300 bg-amber-400/15' : rank === 2 ? 'text-slate-200 bg-slate-300/15' : 'text-orange-300 bg-orange-400/15';

const Leaderboard = () => (
  <section id="profile" className="py-24 relative">
    <div className="container">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <span className="text-sm font-semibold text-gradient uppercase tracking-widest">Соревнование</span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-3 leading-tight mb-5">
            Рейтинг <span className="text-gradient">лидеров</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Зарабатывай XP за уроки и задачи, поднимайся в таблице и борись за место в топе недели. Лучшие получают эксклюзивные бейджи.
          </p>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center font-display font-bold text-xl glow">
                А
              </div>
              <div>
                <div className="font-semibold text-lg">Твой профиль</div>
                <div className="text-sm text-muted-foreground">Анна Ветрова · Ур. 21</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'Trophy', v: '#3', l: 'место' },
                { icon: 'Zap', v: '15.3K', l: 'XP' },
                { icon: 'Medal', v: '8', l: 'бейджей' },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl bg-secondary/60 p-3 text-center">
                  <Icon name={x.icon} size={18} className="mx-auto mb-1 text-primary" />
                  <div className="font-display font-bold">{x.v}</div>
                  <div className="text-[11px] text-muted-foreground">{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 glass rounded-3xl p-4 md:p-6">
          <div className="flex items-center justify-between px-3 mb-4">
            <h3 className="font-display font-bold text-lg">Топ недели</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-400/15 text-cyan-300 font-medium">
              Лига «Профи»
            </span>
          </div>
          <div className="space-y-2">
            {leaders.map((u) => (
              <div
                key={u.rank}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${
                  u.me ? 'bg-gradient-brand/10 border border-primary/30' : 'hover:bg-secondary/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                  u.rank <= 3 ? medalColor(u.rank) : 'bg-secondary text-muted-foreground'
                }`}>
                  {u.rank}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center font-display font-bold shrink-0">
                  {u.letter}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate flex items-center gap-2">
                    {u.name}
                    {u.me && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">вы</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{u.role} · Ур. {u.level}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display font-bold text-gradient">{u.xp.toLocaleString('ru-RU')}</div>
                  <div className="text-[11px] text-muted-foreground">XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Leaderboard;
