import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Worker {
  id: string;
  name: string;
  tasksDone: string;
  avgTime: string;
  criticalErrors: string;
}

export interface KpiTableData {
  workers: Worker[];
  conclusions: string;
}

const emptyWorker = (): Worker => ({ id: `w${Date.now()}`, name: '', tasksDone: '', avgTime: '', criticalErrors: '' });

const defaultData = (): KpiTableData => ({ workers: [emptyWorker()], conclusions: '' });

const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const kpi1 = (w: Worker) => {
  const time = num(w.avgTime);
  return time > 0 ? (num(w.tasksDone) / time).toFixed(2) : '—';
};

const kpi2 = (w: Worker) => {
  const done = num(w.tasksDone);
  return done > 0 ? (((done - num(w.criticalErrors)) / done) * 100).toFixed(0) + '%' : '—';
};

interface Props {
  value: KpiTableData | null;
  onChange: (v: KpiTableData) => void;
  readOnly?: boolean;
}

const KpiTableBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.workers?.length ? value : defaultData();

  const update = (id: string, key: keyof Worker, text: string) => {
    onChange({ ...data, workers: data.workers.map((w) => (w.id === id ? { ...w, [key]: text } : w)) });
  };

  const addWorker = () => onChange({ ...data, workers: [...data.workers, emptyWorker()] });
  const removeWorker = (id: string) => onChange({ ...data, workers: data.workers.filter((w) => w.id !== id) });
  const setConclusions = (text: string) => onChange({ ...data, conclusions: text });

  const totalTasks = data.workers.reduce((s, w) => s + num(w.tasksDone), 0);
  const totalTime = data.workers.reduce((s, w) => s + num(w.avgTime), 0);
  const totalErrors = data.workers.reduce((s, w) => s + num(w.criticalErrors), 0);
  const kpi3 = totalTime > 0 ? (totalTasks / totalTime).toFixed(2) : '—';
  const kpi4 = totalTasks > 0 ? (((totalTasks - totalErrors) / totalTasks) * 100).toFixed(0) + '%' : '—';

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon name="Info" size={13} />
        KPI1 (производительность) и KPI2 (качество) рассчитываются автоматически для каждого работника по мере заполнения данных
      </p>
      <div className="rounded-2xl border border-border bg-secondary/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[160px]">Работник (роль в проекте)</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[110px]">Кол-во выполненных задач</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[110px]">Среднее время на задачу, ч</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[100px]">Критических ошибок</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[110px]">Производительность (KPI1)</th>
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[100px]">Качество (KPI2)</th>
              {!readOnly && <th className="px-3 py-3" />}
            </tr>
          </thead>
          <tbody>
            {data.workers.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <Input value={w.name} onChange={(e) => update(w.id, 'name', e.target.value)} readOnly={readOnly} placeholder="Например: Разработчик" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-3 py-2">
                  <Input value={w.tasksDone} onChange={(e) => update(w.id, 'tasksDone', e.target.value)} readOnly={readOnly} placeholder="0" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-3 py-2">
                  <Input value={w.avgTime} onChange={(e) => update(w.id, 'avgTime', e.target.value)} readOnly={readOnly} placeholder="0" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-3 py-2">
                  <Input value={w.criticalErrors} onChange={(e) => update(w.id, 'criticalErrors', e.target.value)} readOnly={readOnly} placeholder="0" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                <td className="px-3 py-2 bg-primary/5">
                  <span className="font-display font-semibold text-primary">{kpi1(w)}</span>
                </td>
                <td className="px-3 py-2 bg-primary/5">
                  <span className="font-display font-semibold text-primary">{kpi2(w)}</span>
                </td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button onClick={() => removeWorker(w.id)} className="text-muted-foreground hover:text-destructive">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-card/40 font-semibold">
              <td className="px-3 py-3">ВСЕГО</td>
              <td className="px-3 py-3">{totalTasks || '—'}</td>
              <td className="px-3 py-3">{totalTime || '—'}</td>
              <td className="px-3 py-3">{totalErrors || '—'}</td>
              <td className="px-3 py-3" colSpan={readOnly ? 2 : 1} />
              {!readOnly && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {!readOnly && (
        <Button variant="outline" onClick={addWorker} className="w-full border-dashed rounded-xl">
          <Icon name="Plus" size={15} className="mr-1.5" /> Добавить работника
        </Button>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Icon name="Gauge" size={12} /> Общая производительность команды
          </div>
          <div className="font-display font-extrabold text-2xl text-gradient">KPI3 = {kpi3}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Общее кол-во задач / общее время на их выполнение</div>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Icon name="ShieldCheck" size={12} /> Общий уровень качества команды
          </div>
          <div className="font-display font-extrabold text-2xl text-gradient">KPI4 = {kpi4}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Доля задач без критических ошибок от общего числа задач</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 p-4">
        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Icon name="ClipboardList" size={12} /> Выводы и рекомендации по улучшению KPI
        </label>
        <Textarea
          value={data.conclusions}
          onChange={(e) => setConclusions(e.target.value)}
          readOnly={readOnly}
          placeholder="Кто из сотрудников более эффективен, как команда справляется в целом, рекомендации по улучшению"
          className="min-h-[80px] text-sm bg-card/60 border-border resize-none"
        />
      </div>
    </div>
  );
};

export default KpiTableBuilder;