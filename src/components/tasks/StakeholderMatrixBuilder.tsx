import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Stakeholder {
  id: string;
  name: string;
  quadrant: 'manage' | 'satisfy' | 'inform' | 'monitor';
}

export interface StakeholderMatrixData {
  stakeholders: Stakeholder[];
}

const quadrants: { key: Stakeholder['quadrant']; title: string; hint: string; color: string }[] = [
  { key: 'manage', title: 'Управлять плотно', hint: 'Высокое влияние, высокий интерес', color: 'border-fuchsia-500/40 bg-fuchsia-500/5' },
  { key: 'satisfy', title: 'Держать довольными', hint: 'Высокое влияние, низкий интерес', color: 'border-violet-500/40 bg-violet-500/5' },
  { key: 'inform', title: 'Информировать', hint: 'Низкое влияние, высокий интерес', color: 'border-cyan-500/40 bg-cyan-500/5' },
  { key: 'monitor', title: 'Наблюдать', hint: 'Низкое влияние, низкий интерес', color: 'border-slate-500/40 bg-slate-500/5' },
];

const defaultData = (): StakeholderMatrixData => ({ stakeholders: [] });

interface Props {
  value: StakeholderMatrixData | null;
  onChange: (v: StakeholderMatrixData) => void;
  readOnly?: boolean;
}

const StakeholderMatrixBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.stakeholders ? value : defaultData();
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const addStakeholder = (quadrant: Stakeholder['quadrant']) => {
    const name = (inputs[quadrant] || '').trim();
    if (!name) return;
    onChange({ stakeholders: [...data.stakeholders, { id: `s${Date.now()}`, name, quadrant }] });
    setInputs((p) => ({ ...p, [quadrant]: '' }));
  };

  const removeStakeholder = (id: string) => {
    onChange({ stakeholders: data.stakeholders.filter((s) => s.id !== id) });
  };

  return (
    <div>
      <div className="flex items-center gap-6 mb-3 px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Icon name="ArrowUp" size={12} /> Влияние</span>
        <span className="flex items-center gap-1.5"><Icon name="ArrowRight" size={12} /> Интерес</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <div key={q.key} className={`rounded-2xl border-2 p-4 min-h-[180px] ${q.color}`}>
            <div className="mb-3">
              <div className="font-display font-semibold text-sm">{q.title}</div>
              <div className="text-[11px] text-muted-foreground">{q.hint}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.stakeholders
                .filter((s) => s.quadrant === q.key)
                .map((s) => (
                  <span
                    key={s.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-xs font-medium"
                  >
                    {s.name}
                    {!readOnly && (
                      <button onClick={() => removeStakeholder(s.id)} className="text-muted-foreground hover:text-destructive">
                        <Icon name="X" size={11} />
                      </button>
                    )}
                  </span>
                ))}
            </div>
            {!readOnly && (
              <div className="flex gap-1.5">
                <Input
                  value={inputs[q.key] || ''}
                  onChange={(e) => setInputs((p) => ({ ...p, [q.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStakeholder(q.key))}
                  placeholder="Имя / роль"
                  className="h-8 text-xs bg-card/60 border-border"
                />
                <Button size="sm" onClick={() => addStakeholder(q.key)} className="h-8 w-8 p-0 bg-secondary hover:bg-primary hover:text-white shrink-0">
                  <Icon name="Plus" size={14} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakeholderMatrixBuilder;
