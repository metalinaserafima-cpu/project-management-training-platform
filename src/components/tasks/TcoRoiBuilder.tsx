import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CostItem {
  id: string;
  name: string;
  value: string;
}

export interface TcoRoiData {
  initialCosts: CostItem[];
  annualCosts: CostItem[];
  benefits: CostItem[];
  years: string;
  conclusion: string;
}

const emptyItem = (name = ''): CostItem => ({ id: `i${Date.now()}${Math.random()}`, name, value: '' });

const defaultData = (): TcoRoiData => ({
  initialCosts: [emptyItem('Закупка оборудования и аппаратного обеспечения'), emptyItem('Лицензии на программное обеспечение'), emptyItem('Услуги внедрения и настройки')],
  annualCosts: [emptyItem('Обслуживание оборудования и аппаратного обеспечения'), emptyItem('Поддержка программного обеспечения'), emptyItem('Обучение персонала')],
  benefits: [emptyItem('Увеличение эффективности работы сотрудников'), emptyItem('Снижение затрат на сторонние услуги'), emptyItem('Увеличение доходов от новых клиентов')],
  years: '5',
  conclusion: '',
});

const num = (v: string) => {
  const n = parseFloat(v.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const fmt = (n: number) => n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });

interface Props {
  value: TcoRoiData | null;
  onChange: (v: TcoRoiData) => void;
  readOnly?: boolean;
}

interface SectionProps {
  title: string;
  icon: string;
  items: CostItem[];
  unitLabel: string;
  readOnly?: boolean;
  onUpdate: (id: string, key: keyof CostItem, val: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

const CostSection = ({ title, icon, items, unitLabel, readOnly, onUpdate, onAdd, onRemove }: SectionProps) => {
  const total = items.reduce((s, it) => s + num(it.value), 0);
  return (
    <div className="rounded-2xl border border-border bg-secondary/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-semibold text-sm flex items-center gap-2">
          <Icon name={icon} size={15} />
          {title}
        </span>
        <span className="text-sm font-display font-bold text-primary">{fmt(total)} ₽</span>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex gap-2">
            <Input
              value={it.name}
              onChange={(e) => onUpdate(it.id, 'name', e.target.value)}
              readOnly={readOnly}
              placeholder="Вид затрат/выгоды"
              className="h-9 text-sm bg-card/60 border-border flex-1"
            />
            <Input
              value={it.value}
              onChange={(e) => onUpdate(it.id, 'value', e.target.value)}
              readOnly={readOnly}
              placeholder={unitLabel}
              className="h-9 text-sm bg-card/60 border-border w-36"
            />
            {!readOnly && (
              <button onClick={() => onRemove(it.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Icon name="Trash2" size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      {!readOnly && (
        <Button variant="ghost" size="sm" onClick={onAdd} className="w-full mt-2.5 h-8 text-xs border border-dashed border-border rounded-lg">
          <Icon name="Plus" size={13} className="mr-1" /> Добавить статью
        </Button>
      )}
    </div>
  );
};

const TcoRoiBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.initialCosts?.length ? value : defaultData();
  const years = Math.max(num(data.years) || 5, 1);

  const updateSection = (section: 'initialCosts' | 'annualCosts' | 'benefits', id: string, key: keyof CostItem, val: string) => {
    onChange({ ...data, [section]: data[section].map((it) => (it.id === id ? { ...it, [key]: val } : it)) });
  };
  const addToSection = (section: 'initialCosts' | 'annualCosts' | 'benefits') => {
    onChange({ ...data, [section]: [...data[section], emptyItem()] });
  };
  const removeFromSection = (section: 'initialCosts' | 'annualCosts' | 'benefits', id: string) => {
    onChange({ ...data, [section]: data[section].filter((it) => it.id !== id) });
  };

  const directCosts = data.initialCosts.reduce((s, it) => s + num(it.value), 0);
  const annualCostsTotal = data.annualCosts.reduce((s, it) => s + num(it.value), 0);
  const indirectCosts = annualCostsTotal * years;
  const tco = directCosts + indirectCosts;

  const annualBenefit = data.benefits.reduce((s, it) => s + num(it.value), 0);
  const totalBenefits = annualBenefit * years;

  const roi = tco > 0 ? ((totalBenefits - tco) / tco) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground shrink-0">Горизонт расчёта (лет)</label>
        <Input
          value={data.years}
          onChange={(e) => onChange({ ...data, years: e.target.value })}
          readOnly={readOnly}
          className="h-9 text-sm bg-card/60 border-border w-20"
        />
      </div>

      <CostSection
        title="Первоначальные инвестиции (прямые затраты)"
        icon="Landmark"
        items={data.initialCosts}
        unitLabel="Стоимость, ₽"
        readOnly={readOnly}
        onUpdate={(id, k, v) => updateSection('initialCosts', id, k, v)}
        onAdd={() => addToSection('initialCosts')}
        onRemove={(id) => removeFromSection('initialCosts', id)}
      />

      <CostSection
        title="Ежегодные эксплуатационные расходы (косвенные затраты)"
        icon="RefreshCw"
        items={data.annualCosts}
        unitLabel="₽ в год"
        readOnly={readOnly}
        onUpdate={(id, k, v) => updateSection('annualCosts', id, k, v)}
        onAdd={() => addToSection('annualCosts')}
        onRemove={(id) => removeFromSection('annualCosts', id)}
      />

      <CostSection
        title="Выгоды от реализации проекта (выручка)"
        icon="TrendingUp"
        items={data.benefits}
        unitLabel="₽ в год"
        readOnly={readOnly}
        onUpdate={(id, k, v) => updateSection('benefits', id, k, v)}
        onAdd={() => addToSection('benefits')}
        onRemove={(id) => removeFromSection('benefits', id)}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Icon name="Calculator" size={12} /> TCO за {years} {years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}
          </div>
          <div className="font-display font-extrabold text-2xl text-gradient">{fmt(tco)} ₽</div>
          <div className="text-[11px] text-muted-foreground mt-1">Прямые затраты + косвенные затраты × {years}</div>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Icon name="PiggyBank" size={12} /> Общие выгоды за {years} {years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}
          </div>
          <div className="font-display font-extrabold text-2xl text-gradient">{fmt(totalBenefits)} ₽</div>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${roi >= 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
          <Icon name="Percent" size={12} /> ROI проекта
        </div>
        <div className={`font-display font-extrabold text-3xl ${roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{roi.toFixed(1)}%</div>
        <div className="text-[11px] text-muted-foreground mt-1">((Общие выгоды − TCO) / TCO) × 100%</div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/20 p-4">
        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Icon name="FileText" size={12} /> Обоснование эффективности проекта
        </label>
        <Textarea
          value={data.conclusion}
          onChange={(e) => onChange({ ...data, conclusion: e.target.value })}
          readOnly={readOnly}
          placeholder="Насколько эффективен проект на основе полученных данных TCO и ROI"
          className="min-h-[80px] text-sm bg-card/60 border-border resize-none"
        />
      </div>
    </div>
  );
};

export default TcoRoiBuilder;
