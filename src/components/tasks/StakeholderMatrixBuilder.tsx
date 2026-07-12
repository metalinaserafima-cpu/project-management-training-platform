import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import TableScrollArea from './TableScrollArea';

type Level = 'high' | 'medium' | 'low';
type Group = 'consumer' | 'other';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  group: Group;
  influence: Level;
  interest: Level;
  strategy: string;
}

export interface StakeholderMatrixData {
  stakeholders: Stakeholder[];
}

const defaultData = (): StakeholderMatrixData => ({ stakeholders: [] });

const emptyDraft = () => ({ name: '', role: '', group: 'other' as Group, influence: 'medium' as Level, interest: 'medium' as Level, strategy: '' });

const groupOptions: { value: Group; label: string }[] = [
  { value: 'consumer', label: 'Потребители' },
  { value: 'other', label: 'Другие интересанты' },
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
const levelValue: Record<Level, number> = { high: 3, medium: 2, low: 1 };

type Importance = 'high' | 'medium' | 'low';

const importanceOf = (s: Stakeholder): Importance => {
  const score = levelValue[s.influence] + levelValue[s.interest];
  if (score >= 5) return 'high';
  if (score === 4) return 'medium';
  return 'low';
};

const importanceDot: Record<Importance, string> = { high: 'bg-rose-400', medium: 'bg-amber-400', low: 'bg-emerald-400' };
const importanceRadius: Record<Importance, number> = { high: 0.62, medium: 0.8, low: 0.96 };

interface Props {
  value: StakeholderMatrixData | null;
  onChange: (v: StakeholderMatrixData) => void;
  readOnly?: boolean;
}

const StakeholderMatrixBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.stakeholders ? value : defaultData();
  const [draft, setDraft] = useState(emptyDraft());

  const addStakeholder = () => {
    if (!draft.name.trim()) return;
    onChange({ stakeholders: [...data.stakeholders, { id: `s${Date.now()}`, ...draft }] });
    setDraft(emptyDraft());
  };

  const removeStakeholder = (id: string) => {
    onChange({ stakeholders: data.stakeholders.filter((s) => s.id !== id) });
  };

  const consumers = data.stakeholders.filter((s) => s.group === 'consumer');
  const others = data.stakeholders.filter((s) => s.group === 'other');

  const consumerPos = (i: number, total: number) => {
    if (total <= 1) return { x: 50, y: 50 };
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const r = 13;
    return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
  };

  const otherPos = (s: Stakeholder, i: number, total: number) => {
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const r = importanceRadius[importanceOf(s)] * 44;
    return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
  };

  return (
    <div>
      <div className="rounded-2xl border border-border bg-secondary/20 p-5">
        <div className="font-display font-semibold text-sm mb-1 flex items-center gap-2">
          <Icon name="Target" size={16} />
          Карта важности стейкхолдеров
        </div>
        <p className="text-xs text-muted-foreground mb-4">В центре — потребители, чем выше влияние и интерес остальных интересантов, тем ближе они к центру</p>

        {data.stakeholders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">Список пуст. Добавьте стейкхолдеров через форму ниже.</p>
        ) : (
          <div className="relative w-full max-w-[440px] mx-auto aspect-square mb-2">
            <div className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20" />
            <div className="absolute inset-[18%] rounded-full bg-primary/20 border border-primary/25" />
            <div className="absolute inset-[38%] rounded-full bg-gradient-brand flex items-center justify-center text-center px-2">
              <span className="text-[11px] font-display font-semibold text-white leading-tight">Потребители</span>
            </div>

            {others.map((s, i) => {
              const pos = otherPos(s, i, others.length);
              return (
                <div
                  key={s.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card border border-border text-xs font-medium shadow-sm whitespace-nowrap">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${importanceDot[importanceOf(s)]}`} />
                    {s.name}
                    {!readOnly && (
                      <button onClick={() => removeStakeholder(s.id)} className="text-muted-foreground hover:text-destructive">
                        <Icon name="X" size={11} />
                      </button>
                    )}
                  </span>
                </div>
              );
            })}

            {consumers.map((s, i) => {
              const pos = consumerPos(i, consumers.length);
              return (
                <div
                  key={s.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white text-foreground border border-white/40 text-xs font-medium shadow-sm whitespace-nowrap">
                    {s.name}
                    {!readOnly && (
                      <button onClick={() => removeStakeholder(s.id)} className="text-muted-foreground hover:text-destructive">
                        <Icon name="X" size={11} />
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {data.stakeholders.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Высокая важность</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Средняя</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Низкая</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 mt-4">
        {data.stakeholders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">Список пуст. Добавьте стейкхолдеров через форму ниже.</p>
        ) : (
          <TableScrollArea>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-display font-semibold px-4 py-3 min-w-[150px]">Название стейкхолдера</th>
                <th className="text-left font-display font-semibold px-4 py-3 min-w-[130px]">Роль</th>
                <th className="text-left font-display font-semibold px-4 py-3 min-w-[110px]">Влияние</th>
                <th className="text-left font-display font-semibold px-4 py-3 min-w-[110px]">Интерес</th>
                <th className="text-left font-display font-semibold px-4 py-3 min-w-[220px]">Стратегия взаимодействия</th>
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
          </TableScrollArea>
        )}
      </div>

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
              <label className="text-xs text-muted-foreground mb-1 block">Группа (для карты)</label>
              <Select value={draft.group} onValueChange={(v: Group) => setDraft((p) => ({ ...p, group: v }))}>
                <SelectTrigger className="h-9 text-sm bg-card/60 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div />
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