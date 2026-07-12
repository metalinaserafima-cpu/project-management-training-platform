import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type RaciRole = 'R' | 'A' | 'C' | 'I' | '';

interface Participant {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
  roles: Record<string, RaciRole>;
}

export interface RaciData {
  participants: Participant[];
  tasks: Task[];
}

const emptyParticipant = (): Participant => ({ id: `p${Date.now()}`, name: '' });
const emptyTask = (participants: Participant[]): Task => ({
  id: `t${Date.now()}`,
  name: '',
  roles: Object.fromEntries(participants.map((p) => [p.id, ''])),
});

const defaultData = (): RaciData => {
  const participants = [emptyParticipant()];
  return { participants, tasks: [emptyTask(participants)] };
};

const raciCycle: RaciRole[] = ['', 'R', 'A', 'C', 'I'];

const raciColor: Record<RaciRole, string> = {
  '': 'bg-card/60 text-muted-foreground',
  R: 'bg-cyan-500/20 text-cyan-300',
  A: 'bg-violet-500/20 text-violet-300',
  C: 'bg-amber-500/20 text-amber-300',
  I: 'bg-emerald-500/20 text-emerald-300',
};

interface Props {
  value: RaciData | null;
  onChange: (v: RaciData) => void;
  readOnly?: boolean;
}

const RaciMatrixBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.participants?.length && value.tasks?.length ? value : defaultData();

  const updateParticipantName = (id: string, name: string) => {
    onChange({ ...data, participants: data.participants.map((p) => (p.id === id ? { ...p, name } : p)) });
  };

  const addParticipant = () => {
    const p = emptyParticipant();
    onChange({
      participants: [...data.participants, p],
      tasks: data.tasks.map((t) => ({ ...t, roles: { ...t.roles, [p.id]: '' } })),
    });
  };

  const removeParticipant = (id: string) => {
    onChange({
      participants: data.participants.filter((p) => p.id !== id),
      tasks: data.tasks.map((t) => {
        const roles = { ...t.roles };
        delete roles[id];
        return { ...t, roles };
      }),
    });
  };

  const updateTaskName = (id: string, name: string) => {
    onChange({ ...data, tasks: data.tasks.map((t) => (t.id === id ? { ...t, name } : t)) });
  };

  const addTask = () => onChange({ ...data, tasks: [...data.tasks, emptyTask(data.participants)] });
  const removeTask = (id: string) => onChange({ ...data, tasks: data.tasks.filter((t) => t.id !== id) });

  const cycleRole = (taskId: string, participantId: string) => {
    if (readOnly) return;
    onChange({
      ...data,
      tasks: data.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const current = t.roles[participantId] || '';
        const idx = raciCycle.indexOf(current);
        const next = raciCycle[(idx + 1) % raciCycle.length];
        return { ...t, roles: { ...t.roles, [participantId]: next } };
      }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-secondary/20 overflow-x-auto p-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-display font-semibold px-3 py-3 min-w-[180px]">Работа / Этап проекта</th>
              {data.participants.map((p) => (
                <th key={p.id} className="text-center font-display font-semibold px-2 py-3 min-w-[120px]">
                  <div className="flex items-center gap-1 justify-center">
                    <Input
                      value={p.name}
                      onChange={(e) => updateParticipantName(p.id, e.target.value)}
                      readOnly={readOnly}
                      placeholder="Участник"
                      className="h-8 text-xs text-center bg-card/60 border-border"
                    />
                    {!readOnly && data.participants.length > 1 && (
                      <button onClick={() => removeParticipant(p.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Icon name="X" size={12} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {!readOnly && <th className="px-2 py-3" />}
            </tr>
          </thead>
          <tbody>
            {data.tasks.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <Input value={t.name} onChange={(e) => updateTaskName(t.id, e.target.value)} readOnly={readOnly} placeholder="Название работы" className="h-9 text-sm bg-card/60 border-border" />
                </td>
                {data.participants.map((p) => (
                  <td key={p.id} className="px-2 py-2 text-center">
                    <button
                      onClick={() => cycleRole(t.id, p.id)}
                      disabled={readOnly}
                      className={`w-9 h-9 rounded-lg font-display font-bold text-sm mx-auto flex items-center justify-center transition-colors ${raciColor[t.roles[p.id] || '']} ${!readOnly ? 'hover:opacity-80 cursor-pointer' : ''}`}
                    >
                      {t.roles[p.id] || '—'}
                    </button>
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-2 py-2">
                    <button onClick={() => removeTask(t.id)} className="text-muted-foreground hover:text-destructive">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 flex-wrap text-[11px] text-muted-foreground px-1">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[9px]">R</span> Responsible — исполнитель</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-[9px]">A</span> Accountable — ответственный</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[9px]">C</span> Consulted — консультирует</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[9px]">I</span> Informed — информируется</span>
      </div>

      {!readOnly && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={addTask} className="flex-1 border-dashed rounded-xl">
            <Icon name="Plus" size={15} className="mr-1.5" /> Добавить работу
          </Button>
          <Button variant="outline" onClick={addParticipant} className="flex-1 border-dashed rounded-xl">
            <Icon name="UserPlus" size={15} className="mr-1.5" /> Добавить участника
          </Button>
        </div>
      )}
    </div>
  );
};

export default RaciMatrixBuilder;
