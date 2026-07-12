import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Goal {
  id: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  actions: string;
}

export interface SmartGoalsData {
  goals: Goal[];
}

const emptyGoal = (): Goal => ({
  id: `g${Date.now()}`,
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: '',
  actions: '',
});

const defaultData = (): SmartGoalsData => ({ goals: [emptyGoal()] });

const fields: { key: keyof Omit<Goal, 'id' | 'actions'>; label: string; letter: string }[] = [
  { key: 'specific', label: 'Конкретная', letter: 'S' },
  { key: 'measurable', label: 'Измеримая', letter: 'M' },
  { key: 'achievable', label: 'Достижимая', letter: 'A' },
  { key: 'relevant', label: 'Значимая', letter: 'R' },
  { key: 'timeBound', label: 'Ограничена во времени', letter: 'T' },
];

interface Props {
  value: SmartGoalsData | null;
  onChange: (v: SmartGoalsData) => void;
  readOnly?: boolean;
}

const SmartGoalsBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.goals?.length ? value : defaultData();

  const updateGoal = (id: string, key: keyof Goal, text: string) => {
    onChange({ goals: data.goals.map((g) => (g.id === id ? { ...g, [key]: text } : g)) });
  };

  const addGoal = () => onChange({ goals: [...data.goals, emptyGoal()] });
  const removeGoal = (id: string) => onChange({ goals: data.goals.filter((g) => g.id !== id) });

  return (
    <div className="space-y-5">
      {data.goals.map((g, i) => (
        <div key={g.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="flex items-center justify-between mb-3.5">
            <span className="font-display font-semibold text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-brand text-white flex items-center justify-center text-xs">{i + 1}</span>
              Цель {i + 1}
            </span>
            {!readOnly && data.goals.length > 1 && (
              <button onClick={() => removeGoal(g.id)} className="text-muted-foreground hover:text-destructive">
                <Icon name="Trash2" size={15} />
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">{f.letter}</span>
                  {f.label}
                </label>
                <Input
                  value={g[f.key]}
                  onChange={(e) => updateGoal(g.id, f.key, e.target.value)}
                  readOnly={readOnly}
                  className="h-9 text-sm bg-card/60 border-border"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Мероприятия по достижению</label>
            <Textarea
              value={g.actions}
              onChange={(e) => updateGoal(g.id, 'actions', e.target.value)}
              readOnly={readOnly}
              placeholder="Какие шаги приведут к цели?"
              className="min-h-[60px] text-sm bg-card/60 border-border resize-none"
            />
          </div>
        </div>
      ))}
      {!readOnly && (
        <Button variant="outline" onClick={addGoal} className="w-full border-dashed rounded-xl">
          <Icon name="Plus" size={15} className="mr-1.5" /> Добавить цель
        </Button>
      )}
    </div>
  );
};

export default SmartGoalsBuilder;
