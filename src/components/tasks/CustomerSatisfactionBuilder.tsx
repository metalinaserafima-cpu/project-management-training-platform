import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import TableScrollArea from './TableScrollArea';

interface Entity {
  id: string;
  name: string;
}

export interface CsiData {
  criteria: Entity[];
  services: Entity[];
  respondents: Entity[];
  refScores: Record<string, Record<string, string>>;
  actualScores: Record<string, Record<string, string>>;
  conclusion: string;
}

const defaultCriteria = [
  'Соответствие качества продукта/услуги установленным требованиям',
  'Своевременность оказания услуг/разработки и реализации продукта',
  'Оперативность рассмотрения запросов, замечаний и претензий',
  'Работа персонала компании в ходе оказания услуг',
  'Доступность информации об услуге/продукте',
  'Стоимость услуги/продукта',
];

const mkEntity = (name = ''): Entity => ({ id: `e${Date.now()}${Math.random()}`, name });

const defaultData = (): CsiData => ({
  criteria: defaultCriteria.map(mkEntity),
  services: [mkEntity('Продукт 1'), mkEntity('Продукт 2')],
  respondents: [mkEntity('Респондент 1'), mkEntity('Респондент 2'), mkEntity('Респондент 3')],
  refScores: {},
  actualScores: {},
  conclusion: '',
});

const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

interface Props {
  value: CsiData | null;
  onChange: (v: CsiData) => void;
  readOnly?: boolean;
}

const CustomerSatisfactionBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.criteria?.length ? value : defaultData();

  const setScore = (map: 'refScores' | 'actualScores', criterionId: string, entityId: string, val: string) => {
    onChange({
      ...data,
      [map]: {
        ...data[map],
        [criterionId]: { ...(data[map][criterionId] || {}), [entityId]: val },
      },
    });
  };

  const updateCriterion = (id: string, name: string) => onChange({ ...data, criteria: data.criteria.map((c) => (c.id === id ? { ...c, name } : c)) });
  const addCriterion = () => onChange({ ...data, criteria: [...data.criteria, mkEntity('')] });
  const removeCriterion = (id: string) => onChange({ ...data, criteria: data.criteria.filter((c) => c.id !== id) });

  const updateEntity = (list: 'services' | 'respondents', id: string, name: string) =>
    onChange({ ...data, [list]: data[list].map((e) => (e.id === id ? { ...e, name } : e)) });
  const addEntity = (list: 'services' | 'respondents', prefix: string) =>
    onChange({ ...data, [list]: [...data[list], mkEntity(`${prefix} ${data[list].length + 1}`)] });
  const removeEntity = (list: 'services' | 'respondents', id: string) =>
    onChange({ ...data, [list]: data[list].filter((e) => e.id !== id) });

  const refAvg = (criterionId: string) => {
    const scores = data.services.map((s) => num(data.refScores[criterionId]?.[s.id] || ''));
    const valid = scores.filter((s) => s > 0);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  };

  const actualAvg = (criterionId: string) => {
    const scores = data.respondents.map((r) => num(data.actualScores[criterionId]?.[r.id] || ''));
    const valid = scores.filter((s) => s > 0);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  };

  const ratios = data.criteria.map((c) => {
    const ref = refAvg(c.id);
    const act = actualAvg(c.id);
    return ref > 0 ? act / ref : null;
  });
  const validRatios = ratios.filter((r): r is number => r !== null);
  const k1 = validRatios.length ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length : 0;
  const satisfied = k1 >= 1;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-secondary/20 p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="font-display font-semibold text-sm flex items-center gap-2">
            <Icon name="Target" size={15} /> Таблица 1. Эталонная (целевая) оценка
          </span>
          {!readOnly && (
            <Button size="sm" variant="outline" onClick={() => addEntity('services', 'Продукт')} className="h-8 text-xs rounded-lg border-dashed">
              <Icon name="Plus" size={13} className="mr-1" /> Добавить услугу/продукт
            </Button>
          )}
        </div>
        <TableScrollArea>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium px-2 py-2 min-w-[220px]">Критерий</th>
                {data.services.map((s) => (
                  <th key={s.id} className="px-2 py-2 min-w-[110px]">
                    <div className="flex items-center gap-1">
                      <Input value={s.name} onChange={(e) => updateEntity('services', s.id, e.target.value)} readOnly={readOnly} className="h-8 text-xs bg-card/60 border-border" />
                      {!readOnly && data.services.length > 1 && (
                        <button onClick={() => removeEntity('services', s.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Icon name="X" size={11} /></button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 min-w-[80px] text-center font-medium">Среднее εj</th>
              </tr>
            </thead>
            <tbody>
              {data.criteria.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-1.5 text-xs">{c.name}</td>
                  {data.services.map((s) => (
                    <td key={s.id} className="px-2 py-1.5">
                      <Input
                        value={data.refScores[c.id]?.[s.id] || ''}
                        onChange={(e) => setScore('refScores', c.id, s.id, e.target.value)}
                        readOnly={readOnly}
                        placeholder="1-5"
                        className="h-8 text-xs bg-card/60 border-border w-16"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center font-display font-semibold text-primary">{refAvg(c.id) ? refAvg(c.id).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollArea>
        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={() => addEntity('services', 'Продукт')} className="w-full mt-3 h-8 text-xs border border-dashed border-border rounded-lg">
            <Icon name="Plus" size={13} className="mr-1" /> Ещё услуга/продукт
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="font-display font-semibold text-sm flex items-center gap-2">
            <Icon name="ClipboardCheck" size={15} /> Таблица 2. Лист оценки одногруппников
          </span>
          {!readOnly && (
            <Button size="sm" variant="outline" onClick={() => addEntity('respondents', 'Респондент')} className="h-8 text-xs rounded-lg border-dashed">
              <Icon name="Plus" size={13} className="mr-1" /> Добавить респондента
            </Button>
          )}
        </div>
        <TableScrollArea>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium px-2 py-2 min-w-[220px]">Критерий</th>
                {data.respondents.map((r) => (
                  <th key={r.id} className="px-2 py-2 min-w-[110px]">
                    <div className="flex items-center gap-1">
                      <Input value={r.name} onChange={(e) => updateEntity('respondents', r.id, e.target.value)} readOnly={readOnly} className="h-8 text-xs bg-card/60 border-border" />
                      {!readOnly && data.respondents.length > 1 && (
                        <button onClick={() => removeEntity('respondents', r.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Icon name="X" size={11} /></button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 min-w-[80px] text-center font-medium">Среднее kj</th>
              </tr>
            </thead>
            <tbody>
              {data.criteria.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-1.5 text-xs">{c.name}</td>
                  {data.respondents.map((r) => (
                    <td key={r.id} className="px-2 py-1.5">
                      <Input
                        value={data.actualScores[c.id]?.[r.id] || ''}
                        onChange={(e) => setScore('actualScores', c.id, r.id, e.target.value)}
                        readOnly={readOnly}
                        placeholder="1-5"
                        className="h-8 text-xs bg-card/60 border-border w-16"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center font-display font-semibold text-primary">{actualAvg(c.id) ? actualAvg(c.id).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollArea>
        {!readOnly && (
          <div className="grid sm:grid-cols-2 gap-2 mt-3">
            <Button variant="ghost" size="sm" onClick={() => addEntity('respondents', 'Респондент')} className="h-8 text-xs border border-dashed border-border rounded-lg">
              <Icon name="Plus" size={13} className="mr-1" /> Ещё респондент
            </Button>
            <Button variant="ghost" size="sm" onClick={addCriterion} className="h-8 text-xs border border-dashed border-border rounded-lg">
              <Icon name="Plus" size={13} className="mr-1" /> Добавить критерий
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20">
      <TableScrollArea>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[220px]">Критерий</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[90px]">kj (оценка)</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[90px]">εj (эталон)</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[80px]">kj / εj</th>
              {!readOnly && <th className="px-3 py-3" />}
            </tr>
          </thead>
          <tbody>
            {data.criteria.map((c, i) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-xs">{c.name}</td>
                <td className="px-3 py-2 font-display font-semibold">{actualAvg(c.id) ? actualAvg(c.id).toFixed(2) : '—'}</td>
                <td className="px-3 py-2 font-display font-semibold">{refAvg(c.id) ? refAvg(c.id).toFixed(2) : '—'}</td>
                <td className="px-3 py-2 font-display font-semibold text-primary">{ratios[i] !== null ? ratios[i]!.toFixed(2) : '—'}</td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button onClick={() => removeCriterion(c.id)} className="text-muted-foreground hover:text-destructive">
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

      <div className={`rounded-2xl border p-5 ${satisfied ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
          <Icon name="Smile" size={12} /> Показатель удовлетворённости потребителя K1
        </div>
        <div className={`font-display font-extrabold text-3xl ${satisfied ? 'text-emerald-400' : 'text-rose-400'}`}>{k1.toFixed(2)}</div>
        <div className="text-sm mt-2 flex items-center gap-1.5">
          <Icon name={satisfied ? 'CheckCircle2' : 'AlertCircle'} size={15} className={satisfied ? 'text-emerald-400' : 'text-rose-400'} />
          {satisfied ? 'Потребитель удовлетворён результатом услуги/продукта (K1 ≥ 1)' : 'Потребитель не удовлетворён — требуются корректирующие мероприятия (K1 < 1)'}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 p-4">
        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Icon name="FileText" size={12} /> Выводы
        </label>
        <Textarea
          value={data.conclusion}
          onChange={(e) => onChange({ ...data, conclusion: e.target.value })}
          readOnly={readOnly}
          placeholder="Насколько потребитель удовлетворён услугой/продуктом, какие мероприятия по улучшению качества требуются"
          className="min-h-[70px] text-sm bg-card/60 border-border resize-none"
        />
      </div>
    </div>
  );
};

export default CustomerSatisfactionBuilder;