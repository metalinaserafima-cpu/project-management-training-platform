import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface Card {
  id: string;
  text: string;
}

type ColumnKey = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

interface KanbanColumn {
  key: ColumnKey;
  title: string;
  cards: Card[];
}

export interface KanbanBoardData {
  columns: KanbanColumn[];
}

const columnMeta: { key: ColumnKey; title: string; color: string }[] = [
  { key: 'backlog', title: 'Бэклог', color: 'border-t-slate-400' },
  { key: 'todo', title: 'Сделать', color: 'border-t-cyan-400' },
  { key: 'in_progress', title: 'В процессе', color: 'border-t-amber-400' },
  { key: 'review', title: 'Проверка', color: 'border-t-violet-400' },
  { key: 'done', title: 'Готово', color: 'border-t-emerald-400' },
];

const defaultData = (): KanbanBoardData => ({
  columns: columnMeta.map((c) => ({ key: c.key, title: c.title, cards: [] })),
});

interface Props {
  value: KanbanBoardData | null;
  onChange: (v: KanbanBoardData) => void;
  readOnly?: boolean;
}

const KanbanBuilder = ({ value, onChange, readOnly }: Props) => {
  const data = value && value.columns?.length ? value : defaultData();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [dragCard, setDragCard] = useState<{ cardId: string; fromKey: ColumnKey } | null>(null);

  const getColumn = (key: ColumnKey) => data.columns.find((c) => c.key === key);

  const addCard = (key: ColumnKey) => {
    const text = (drafts[key] || '').trim();
    if (!text) return;
    onChange({
      columns: data.columns.map((c) => (c.key === key ? { ...c, cards: [...c.cards, { id: `c${Date.now()}`, text }] } : c)),
    });
    setDrafts((d) => ({ ...d, [key]: '' }));
  };

  const removeCard = (key: ColumnKey, cardId: string) => {
    onChange({ columns: data.columns.map((c) => (c.key === key ? { ...c, cards: c.cards.filter((cd) => cd.id !== cardId) } : c)) });
  };

  const moveCard = (cardId: string, fromKey: ColumnKey, toKey: ColumnKey) => {
    if (fromKey === toKey) return;
    const fromCol = getColumn(fromKey);
    const card = fromCol?.cards.find((c) => c.id === cardId);
    if (!card) return;
    onChange({
      columns: data.columns.map((c) => {
        if (c.key === fromKey) return { ...c, cards: c.cards.filter((cd) => cd.id !== cardId) };
        if (c.key === toKey) return { ...c, cards: [...c.cards, card] };
        return c;
      }),
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {columnMeta.map((meta) => {
        const col = getColumn(meta.key);
        return (
          <div
            key={meta.key}
            className={`rounded-2xl border border-border border-t-2 ${meta.color} bg-secondary/20 p-3 flex flex-col min-h-[220px]`}
            onDragOver={(e) => !readOnly && e.preventDefault()}
            onDrop={() => {
              if (!readOnly && dragCard) {
                moveCard(dragCard.cardId, dragCard.fromKey, meta.key);
                setDragCard(null);
              }
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-semibold text-xs">{meta.title}</span>
              <span className="text-[10px] text-muted-foreground bg-card/60 rounded-full px-2 py-0.5">{col?.cards.length || 0}</span>
            </div>
            <div className="space-y-2 flex-1">
              {col?.cards.map((card) => (
                <div
                  key={card.id}
                  draggable={!readOnly}
                  onDragStart={() => setDragCard({ cardId: card.id, fromKey: meta.key })}
                  className={`bg-card border border-border rounded-xl px-3 py-2 text-xs flex items-start justify-between gap-2 group ${!readOnly ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                  <span className="leading-snug">{card.text}</span>
                  {!readOnly && (
                    <button onClick={() => removeCard(meta.key, card.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Icon name="X" size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!readOnly && (
              <div className="mt-2.5 flex gap-1.5">
                <Input
                  value={drafts[meta.key] || ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [meta.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addCard(meta.key)}
                  placeholder="Добавить..."
                  className="h-8 text-xs bg-card/60 border-border"
                />
                <button onClick={() => addCard(meta.key)} className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                  <Icon name="Plus" size={14} className="text-white" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBuilder;
