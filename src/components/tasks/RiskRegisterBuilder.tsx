import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import TableScrollArea from './TableScrollArea';

type Level = 'high' | 'medium' | 'low';

interface Risk {
  id: string;
  stage: string;
  description: string;
  consequences: string;
  damage: Level;
  probability: Level;
  measures: string;
  owner: string;
}

export interface RiskRegisterData {
  risks: Risk[];
}

const emptyRisk = (): Risk => ({
  id: `r${Date.now()}`,
  stage: '',
  description: '',
  consequences: '',
  damage: 'medium',
  probability: 'medium',
  measures: '',
  owner: '',
});

const defaultData = (): RiskRegisterData => ({ risks: [emptyRisk()] });

const levelOptions: { value: Level; label: string }[] = [
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
];

const levelValue: Record<Level, number> = { high: 3, medium: 2, low: 1 };

const riskLevelOf = (r: Risk): Level => {
  const score = levelValue[r.damage] * levelValue[r.probability];
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
};

const levelBadge: Record<Level, string> = {
  high: 'text-rose-300 bg-rose-400/15',
  medium: 'text-amber-300 bg-amber-400/15',
  low: 'text-emerald-300 bg-emerald-400/15',
};

const levelLabel: Record<Level, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };

interface Props {
  value: RiskRegisterData | null;
  onChange: (v: RiskRegisterData) => void;
  readOnly?: boolean;
}

const RiskRegisterBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.risks?.length ? value : defaultData();

  const update = (id: string, key: keyof Risk, text: string) => {
    onChange({ risks: data.risks.map((r) => (r.id === id ? { ...r, [key]: text } : r)) });
  };

  const addRisk = () => onChange({ risks: [...data.risks, emptyRisk()] });
  const removeRisk = (id: string) => onChange({ risks: data.risks.filter((r) => r.id !== id) });

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon name="MoveHorizontal" size={13} />
        В таблице 8 граф, включая «Владелец риска» — используйте стрелки или прокрутите её вправо
      </p>
      <div className="rounded-2xl border border-border bg-secondary/20">
      <TableScrollArea>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[110px]">Этап реализации проекта</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[160px]">Описание риска</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[160px]">Возможные последствия</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[95px]">Ущерб</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[95px]">Вероятность</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[100px]">Уровень риска</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[160px]">Мероприятия по снижению риска</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[130px] bg-primary/10">Владелец риска</th>
              {!readOnly && <th className="px-3 py-3" />}
            </tr>
          </thead>
          <tbody>
            {data.risks.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 align-top">
                <td className="px-3 py-2">
                  <Input value={r.stage} onChange={(e) => update(r.id, 'stage', e.target.value)} readOnly={readOnly} placeholder="Этап" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-3 py-2">
                  <Textarea value={r.description} onChange={(e) => update(r.id, 'description', e.target.value)} readOnly={readOnly} placeholder="Описание риска" className="min-h-[52px] text-sm bg-card/60 border-border resize-none" />
                </td>
                <td className="px-3 py-2">
                  <Textarea value={r.consequences} onChange={(e) => update(r.id, 'consequences', e.target.value)} readOnly={readOnly} placeholder="Последствия" className="min-h-[52px] text-sm bg-card/60 border-border resize-none" />
                </td>
                <td className="px-3 py-2">
                  <Select value={r.damage} onValueChange={(v: Level) => update(r.id, 'damage', v)} disabled={readOnly}>
                    <SelectTrigger className="h-9 text-sm bg-card/60 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Select value={r.probability} onValueChange={(v: Level) => update(r.id, 'probability', v)} disabled={readOnly}>
                    <SelectTrigger className="h-9 text-sm bg-card/60 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${levelBadge[riskLevelOf(r)]}`}>{levelLabel[riskLevelOf(r)]}</span>
                </td>
                <td className="px-3 py-2">
                  <Textarea value={r.measures} onChange={(e) => update(r.id, 'measures', e.target.value)} readOnly={readOnly} placeholder="Мероприятия по снижению" className="min-h-[52px] text-sm bg-card/60 border-border resize-none" />
                </td>
                <td className="px-3 py-2 bg-primary/5">
                  <Input value={r.owner} onChange={(e) => update(r.id, 'owner', e.target.value)} readOnly={readOnly} placeholder="ФИО / роль" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button onClick={() => removeRisk(r.id)} className="text-muted-foreground hover:text-destructive">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </TableScrollArea>
      </div>

      {!readOnly && (
        <Button variant="outline" onClick={addRisk} className="w-full border-dashed rounded-xl">
          <Icon name="Plus" size={15} className="mr-1.5" /> Добавить риск
        </Button>
      )}
    </div>
  );
};

export default RiskRegisterBuilder;