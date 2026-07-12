import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Persona {
  id: string;
  name: string;
  role: string;
  age: string;
  segment: string;
  goals: string;
  painPoints: string;
  avatarColor: string;
}

export interface PersonaData {
  personas: Persona[];
}

const AVATAR_COLORS = ['from-violet-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-600', 'from-amber-500 to-orange-600'];

const emptyPersona = (i: number): Persona => ({
  id: `p${Date.now()}${i}`,
  name: '',
  role: '',
  age: '',
  segment: '',
  goals: '',
  painPoints: '',
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
});

const defaultData = (): PersonaData => ({ personas: [emptyPersona(0)] });

interface Props {
  value: PersonaData | null;
  onChange: (v: PersonaData) => void;
  readOnly?: boolean;
}

const PersonaBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.personas?.length ? value : defaultData();

  const update = (id: string, key: keyof Persona, text: string) => {
    onChange({ personas: data.personas.map((p) => (p.id === id ? { ...p, [key]: text } : p)) });
  };

  const addPersona = () => onChange({ personas: [...data.personas, emptyPersona(data.personas.length)] });
  const removePersona = (id: string) => onChange({ personas: data.personas.filter((p) => p.id !== id) });

  return (
    <div className="space-y-4">
      {data.personas.map((p) => (
        <div key={p.id} className="rounded-2xl border border-border bg-secondary/20 p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.avatarColor} flex items-center justify-center shrink-0`}>
              <Icon name="User" size={26} className="text-white" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2.5">
              <Input
                value={p.name}
                onChange={(e) => update(p.id, 'name', e.target.value)}
                readOnly={readOnly}
                placeholder="Имя персоны"
                className="h-9 text-sm font-medium bg-card/60 border-border"
              />
              <Input
                value={p.role}
                onChange={(e) => update(p.id, 'role', e.target.value)}
                readOnly={readOnly}
                placeholder="Роль (напр. Product Manager)"
                className="h-9 text-sm bg-card/60 border-border"
              />
              <Input
                value={p.age}
                onChange={(e) => update(p.id, 'age', e.target.value)}
                readOnly={readOnly}
                placeholder="Возраст, город"
                className="h-9 text-sm bg-card/60 border-border"
              />
              <Input
                value={p.segment}
                onChange={(e) => update(p.id, 'segment', e.target.value)}
                readOnly={readOnly}
                placeholder="Сегмент (демография)"
                className="h-9 text-sm bg-card/60 border-border"
              />
            </div>
            {!readOnly && data.personas.length > 1 && (
              <button onClick={() => removePersona(p.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Icon name="Trash2" size={15} />
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Icon name="Target" size={12} /> Цели (зачем взаимодействует с продуктом)
              </label>
              <Textarea
                value={p.goals}
                onChange={(e) => update(p.id, 'goals', e.target.value)}
                readOnly={readOnly}
                className="min-h-[70px] text-sm bg-card/60 border-border resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Icon name="AlertTriangle" size={12} /> Боли и трудности
              </label>
              <Textarea
                value={p.painPoints}
                onChange={(e) => update(p.id, 'painPoints', e.target.value)}
                readOnly={readOnly}
                className="min-h-[70px] text-sm bg-card/60 border-border resize-none"
              />
            </div>
          </div>
        </div>
      ))}
      {!readOnly && (
        <Button variant="outline" onClick={addPersona} className="w-full border-dashed rounded-xl">
          <Icon name="UserPlus" size={15} className="mr-1.5" /> Добавить персону
        </Button>
      )}
    </div>
  );
};

export default PersonaBuilder;
