import Icon from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';

export interface BaccmData {
  need: string;
  change: string;
  solution: string;
  stakeholders: string;
  value: string;
  context: string;
}

const defaultData = (): BaccmData => ({
  need: '',
  change: '',
  solution: '',
  stakeholders: '',
  value: '',
  context: '',
});

const fields: { key: keyof BaccmData; label: string; icon: string; placeholder: string; color: string }[] = [
  { key: 'need', label: 'Потребность', icon: 'AlertCircle', placeholder: 'Какая проблема или потребность стоит за проектом?', color: 'border-violet-500/40 bg-violet-500/5' },
  { key: 'change', label: 'Изменение', icon: 'RefreshCw', placeholder: 'Что должно измениться, чтобы закрыть потребность?', color: 'border-pink-500/40 bg-pink-500/5' },
  { key: 'solution', label: 'Решение', icon: 'Lightbulb', placeholder: 'Какое решение вы предлагаете?', color: 'border-cyan-500/40 bg-cyan-500/5' },
  { key: 'stakeholders', label: 'Заинтересованные стороны', icon: 'Users', placeholder: 'Кто участвует и на кого влияет проект?', color: 'border-amber-500/40 bg-amber-500/5' },
  { key: 'value', label: 'Ценность', icon: 'Gem', placeholder: 'Какую ценность это создаёт для бизнеса и пользователей?', color: 'border-emerald-500/40 bg-emerald-500/5' },
  { key: 'context', label: 'Контекст', icon: 'Globe', placeholder: 'В каких условиях и ограничениях существует проект?', color: 'border-fuchsia-500/40 bg-fuchsia-500/5' },
];

interface Props {
  value: BaccmData | null;
  onChange: (v: BaccmData) => void;
  readOnly?: boolean;
}

const BaccmBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value || defaultData();

  const setField = (key: keyof BaccmData, text: string) => {
    onChange({ ...data, [key]: text });
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.key} className={`rounded-2xl border-2 p-4 ${f.color}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <Icon name={f.icon} size={16} className="text-foreground" />
            <span className="font-display font-semibold text-sm">{f.label}</span>
          </div>
          <Textarea
            value={data[f.key]}
            onChange={(e) => setField(f.key, e.target.value)}
            placeholder={f.placeholder}
            readOnly={readOnly}
            className="min-h-[90px] bg-card/60 border-border resize-none text-sm"
          />
        </div>
      ))}
    </div>
  );
};

export default BaccmBuilder;
