import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Stage {
  id: string;
  name: string;
  start: string;
  end: string;
  responsible: string;
}

export interface GanttData {
  stages: Stage[];
}

const emptyStage = (): Stage => ({ id: `st${Date.now()}`, name: '', start: '', end: '', responsible: '' });

const defaultData = (): GanttData => ({ stages: [emptyStage()] });

const barColors = ['bg-violet-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500', 'bg-blue-500'];

interface Props {
  value: GanttData | null;
  onChange: (v: GanttData) => void;
  readOnly?: boolean;
}

const GanttChartBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.stages?.length ? value : defaultData();

  const update = (id: string, key: keyof Stage, text: string) => {
    onChange({ stages: data.stages.map((s) => (s.id === id ? { ...s, [key]: text } : s)) });
  };

  const addStage = () => onChange({ stages: [...data.stages, emptyStage()] });
  const removeStage = (id: string) => onChange({ stages: data.stages.filter((s) => s.id !== id) });

  const validStages = data.stages.filter((s) => s.start && s.end);
  const dates = validStages.flatMap((s) => [new Date(s.start).getTime(), new Date(s.end).getTime()]);
  const minDate = dates.length ? Math.min(...dates) : 0;
  const maxDate = dates.length ? Math.max(...dates) : 1;
  const span = Math.max(maxDate - minDate, 1);

  return (
    <div>
      <div className="rounded-2xl border border-border bg-secondary/20 p-5">
        <div className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
          <Icon name="GanttChartSquare" size={16} />
          Диаграмма Ганта
        </div>

        {validStages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Заполните даты начала и окончания этапов, чтобы увидеть диаграмму</p>
        ) : (
          <div className="space-y-2.5">
            {validStages.map((s, i) => {
              const start = new Date(s.start).getTime();
              const end = new Date(s.end).getTime();
              const left = ((start - minDate) / span) * 100;
              const width = Math.max(((end - start) / span) * 100, 2);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-32 shrink-0 truncate">{s.name || 'Без названия'}</span>
                  <div className="flex-1 h-6 bg-card rounded-full relative overflow-hidden border border-border">
                    <div
                      className={`absolute h-full rounded-full ${barColors[i % barColors.length]}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground w-36 shrink-0 text-right">
                    {new Date(s.start).toLocaleDateString('ru-RU')} – {new Date(s.end).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-display font-semibold px-4 py-3">Этап проекта</th>
              <th className="text-left font-display font-semibold px-4 py-3">Начало</th>
              <th className="text-left font-display font-semibold px-4 py-3">Окончание</th>
              <th className="text-left font-display font-semibold px-4 py-3">Ответственный</th>
              {!readOnly && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {data.stages.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2">
                  <Input value={s.name} onChange={(e) => update(s.id, 'name', e.target.value)} readOnly={readOnly} placeholder="Название этапа" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-4 py-2">
                  <Input type="date" value={s.start} onChange={(e) => update(s.id, 'start', e.target.value)} readOnly={readOnly} className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-4 py-2">
                  <Input type="date" value={s.end} onChange={(e) => update(s.id, 'end', e.target.value)} readOnly={readOnly} className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-4 py-2">
                  <Input value={s.responsible} onChange={(e) => update(s.id, 'responsible', e.target.value)} readOnly={readOnly} placeholder="Ответственный" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                {!readOnly && (
                  <td className="px-4 py-2">
                    <button onClick={() => removeStage(s.id)} className="text-muted-foreground hover:text-destructive">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <Button variant="outline" onClick={addStage} className="w-full mt-4 border-dashed rounded-xl">
          <Icon name="Plus" size={15} className="mr-1.5" /> Добавить этап
        </Button>
      )}
    </div>
  );
};

export default GanttChartBuilder;
