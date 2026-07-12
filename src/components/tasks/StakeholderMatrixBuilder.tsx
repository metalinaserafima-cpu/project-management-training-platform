import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type Level = 'high' | 'medium' | 'low';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: Level;
  interest: Level;
  strategy: string;
}

export interface StakeholderMatrixData {
  stakeholders: Stakeholder[];
}

type QuadrantKey = 'manage' | 'satisfy' | 'inform' | 'monitor';

const quadrants: { key: QuadrantKey; title: string; hint: string; color: string; hex: string }[] = [
  { key: 'manage', title: 'Управлять плотно', hint: 'Высокое влияние, высокий интерес', color: 'border-fuchsia-500/40 bg-fuchsia-500/5', hex: '#d946ef' },
  { key: 'satisfy', title: 'Держать довольными', hint: 'Высокое влияние, низкий интерес', color: 'border-violet-500/40 bg-violet-500/5', hex: '#8b5cf6' },
  { key: 'inform', title: 'Информировать', hint: 'Низкое влияние, высокий интерес', color: 'border-cyan-500/40 bg-cyan-500/5', hex: '#06b6d4' },
  { key: 'monitor', title: 'Наблюдать', hint: 'Низкое влияние, низкий интерес', color: 'border-slate-500/40 bg-slate-500/5', hex: '#64748b' },
];

const levelOptions: { value: Level; label: string }[] = [
  { value: 'high', label: 'Высокое' },
  { value: 'medium', label: 'Среднее' },
  { value: 'low', label: 'Низкое' },
];

const levelBadge: Record<Level, string> = {
  high: 'text-rose-300 bg-rose-400/15',
  medium: 'text-amber-300 bg-amber-400/15',
  low: 'text-emerald-300 bg-emerald-400/15',
};

const levelLabel: Record<Level, string> = { high: 'Высокое', medium: 'Среднее', low: 'Низкое' };

const getQuadrant = (s: Stakeholder): QuadrantKey => {
  const highInfluence = s.influence === 'high';
  const highInterest = s.interest === 'high';
  if (highInfluence && highInterest) return 'manage';
  if (highInfluence && !highInterest) return 'satisfy';
  if (!highInfluence && highInterest) return 'inform';
  return 'monitor';
};

const defaultData = (): StakeholderMatrixData => ({ stakeholders: [] });

const emptyDraft = () => ({ name: '', role: '', influence: 'medium' as Level, interest: 'medium' as Level, strategy: '' });

const views: { key: 'matrix' | 'chart' | 'table'; label: string; icon: string }[] = [
  { key: 'matrix', label: 'Матрица', icon: 'LayoutGrid' },
  { key: 'chart', label: 'Диаграмма', icon: 'PieChart' },
  { key: 'table', label: 'Таблица', icon: 'Table' },
];

interface Props {
  value: StakeholderMatrixData | null;
  onChange: (v: StakeholderMatrixData) => void;
  readOnly?: boolean;
}

const StakeholderMatrixBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.stakeholders ? value : defaultData();
  const [view, setView] = useState<'matrix' | 'chart' | 'table'>('matrix');
  const [draft, setDraft] = useState(emptyDraft());

  const addStakeholder = () => {
    if (!draft.name.trim()) return;
    onChange({ stakeholders: [...data.stakeholders, { id: `s${Date.now()}`, ...draft }] });
    setDraft(emptyDraft());
  };

  const removeStakeholder = (id: string) => {
    onChange({ stakeholders: data.stakeholders.filter((s) => s.id !== id) });
  };

  const chartData = quadrants
    .map((q) => ({ name: q.title, value: data.stakeholders.filter((s) => getQuadrant(s) === q.key).length, color: q.hex }))
    .filter((d) => d.value > 0);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              view === v.key ? 'bg-gradient-brand text-white' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={v.icon} size={14} />
            {v.label}
          </button>
        ))}
      </div>

      {view === 'matrix' && (
        <div>
          <div className="flex items-center gap-6 mb-3 px-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Icon name="ArrowUp" size={12} /> Влияние</span>
            <span className="flex items-center gap-1.5"><Icon name="ArrowRight" size={12} /> Интерес</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quadrants.map((q) => (
              <div key={q.key} className={`rounded-2xl border-2 p-4 min-h-[140px] ${q.color}`}>
                <div className="mb-3">
                  <div className="font-display font-semibold text-sm">{q.title}</div>
                  <div className="text-[11px] text-muted-foreground">{q.hint}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.stakeholders
                    .filter((s) => getQuadrant(s) === q.key)
                    .map((s) => (
                      <span key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-xs font-medium">
                        {s.name}
                        {s.role && <span className="text-muted-foreground font-normal">· {s.role}</span>}
                        {!readOnly && (
                          <button onClick={() => removeStakeholder(s.id)} className="text-muted-foreground hover:text-destructive">
                            <Icon name="X" size={11} />
                          </button>
                        )}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'chart' && (
        <div className="rounded-2xl border border-border bg-secondary/20 p-5">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Нет данных для диаграммы. Добавьте стейкхолдеров через форму ниже.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => `${d.value}`}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {view === 'table' && (
        <div className="rounded-2xl border border-border bg-secondary/20 overflow-x-auto">
          {data.stakeholders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Список пуст. Добавьте стейкхолдеров через форму ниже.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-display font-semibold px-4 py-3">Название стейкхолдера</th>
                  <th className="text-left font-display font-semibold px-4 py-3">Роль</th>
                  <th className="text-left font-display font-semibold px-4 py-3">Влияние</th>
                  <th className="text-left font-display font-semibold px-4 py-3">Интерес</th>
                  <th className="text-left font-display font-semibold px-4 py-3">Стратегия взаимодействия</th>
                  {!readOnly && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {data.stakeholders.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge[s.influence]}`}>{levelLabel[s.influence]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge[s.interest]}`}>{levelLabel[s.interest]}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[240px]">{s.strategy}</td>
                    {!readOnly && (
                      <td className="px-4 py-3">
                        <button onClick={() => removeStakeholder(s.id)} className="text-muted-foreground hover:text-destructive">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!readOnly && (
        <div className="rounded-2xl border border-border bg-secondary/20 p-5 mt-4">
          <div className="font-display font-semibold text-sm mb-3.5 flex items-center gap-2">
            <Icon name="UserPlus" size={16} />
            Добавить стейкхолдера
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Название стейкхолдера</label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="Например: Пользователи (пациенты)"
                className="h-9 text-sm bg-card/60 border-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Роль</label>
              <Input
                value={draft.role}
                onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                placeholder="Например: Конечные клиенты"
                className="h-9 text-sm bg-card/60 border-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Влияние</label>
              <Select value={draft.influence} onValueChange={(v: Level) => setDraft((p) => ({ ...p, influence: v }))}>
                <SelectTrigger className="h-9 text-sm bg-card/60 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Интерес</label>
              <Select value={draft.interest} onValueChange={(v: Level) => setDraft((p) => ({ ...p, interest: v }))}>
                <SelectTrigger className="h-9 text-sm bg-card/60 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-3.5">
            <label className="text-xs text-muted-foreground mb-1 block">Стратегия взаимодействия</label>
            <Textarea
              value={draft.strategy}
              onChange={(e) => setDraft((p) => ({ ...p, strategy: e.target.value }))}
              placeholder="Например: регулярные опросы, сбор обратной связи"
              className="min-h-[60px] text-sm bg-card/60 border-border resize-none"
            />
          </div>
          <Button onClick={addStakeholder} className="w-full bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl">
            <Icon name="Plus" size={15} className="mr-1.5" /> Добавить стейкхолдера
          </Button>
        </div>
      )}
    </div>
  );
};

export default StakeholderMatrixBuilder;
