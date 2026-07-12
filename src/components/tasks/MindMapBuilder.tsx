import { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  color: string;
}

export interface MindMapData {
  nodes: Node[];
}

const COLORS = ['#a78bfa', '#f472b6', '#22d3ee', '#fbbf24', '#34d399'];

const defaultData = (): MindMapData => ({
  nodes: [{ id: 'root', text: 'Идея проекта', x: 400, y: 220, parentId: null, color: '#a78bfa' }],
});

interface Props {
  value: MindMapData | null;
  onChange: (v: MindMapData) => void;
  readOnly?: boolean;
}

const MindMapBuilder = ({ value, onChange, readOnly }: Props) => {
  const [data, setData] = useState<MindMapData>(value && value.nodes?.length ? value : defaultData());
  const [dragId, setDragId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = (next: MindMapData) => {
    setData(next);
    onChange(next);
  };

  const addChild = (parentId: string) => {
    const parent = data.nodes.find((n) => n.id === parentId);
    if (!parent) return;
    const childCount = data.nodes.filter((n) => n.parentId === parentId).length;
    const angle = childCount * 55 - 60;
    const id = `n${Date.now()}`;
    const newNode: Node = {
      id,
      text: 'Новая идея',
      x: parent.x + 220,
      y: parent.y + angle * 1.4,
      parentId,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    update({ nodes: [...data.nodes, newNode] });
    setEditId(id);
  };

  const removeNode = (id: string) => {
    const idsToRemove = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      data.nodes.forEach((n) => {
        if (n.parentId && idsToRemove.has(n.parentId) && !idsToRemove.has(n.id)) {
          idsToRemove.add(n.id);
          changed = true;
        }
      });
    }
    update({ nodes: data.nodes.filter((n) => !idsToRemove.has(n.id)) });
  };

  const renameNode = (id: string, text: string) => {
    update({ nodes: data.nodes.map((n) => (n.id === id ? { ...n, text } : n)) });
  };

  const onMouseDown = (id: string) => (e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setDragId(id);
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setData((prev) => {
        const next = { nodes: prev.nodes.map((n) => (n.id === dragId ? { ...n, x, y } : n)) };
        return next;
      });
    },
    [dragId]
  );

  const onMouseUp = () => {
    if (dragId) onChange(data);
    setDragId(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-secondary/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/40">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon name="MousePointer2" size={13} />
          Перетаскивайте узлы, нажмите + чтобы добавить идею
        </span>
        {!readOnly && (
          <Button size="sm" variant="ghost" onClick={() => update(defaultData())} className="h-7 text-xs text-muted-foreground">
            <Icon name="RotateCcw" size={13} className="mr-1" /> Сбросить
          </Button>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-[420px] overflow-auto cursor-default"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" style={{ minWidth: 900, minHeight: 420 }}>
          {data.nodes
            .filter((n) => n.parentId)
            .map((n) => {
              const parent = data.nodes.find((p) => p.id === n.parentId);
              if (!parent) return null;
              return (
                <line
                  key={n.id}
                  x1={parent.x}
                  y1={parent.y}
                  x2={n.x}
                  y2={n.y}
                  stroke="hsl(258 90% 66% / 0.4)"
                  strokeWidth={2}
                />
              );
            })}
        </svg>
        <div style={{ minWidth: 900, minHeight: 420, position: 'relative' }}>
          {data.nodes.map((n) => (
            <div
              key={n.id}
              onMouseDown={onMouseDown(n.id)}
              style={{ left: n.x, top: n.y, borderColor: n.color }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
            >
              <div
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 bg-card shadow-lg cursor-move select-none"
                style={{ borderColor: n.color }}
              >
                {editId === n.id ? (
                  <input
                    autoFocus
                    value={n.text}
                    onChange={(e) => renameNode(n.id, e.target.value)}
                    onBlur={() => setEditId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditId(null)}
                    className="bg-transparent outline-none text-sm font-medium w-32"
                  />
                ) : (
                  <span
                    onDoubleClick={() => !readOnly && setEditId(n.id)}
                    className="text-sm font-medium whitespace-nowrap px-1"
                  >
                    {n.text}
                  </span>
                )}
                {!readOnly && (
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button onClick={() => addChild(n.id)} className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Icon name="Plus" size={12} />
                    </button>
                    {n.parentId && (
                      <button onClick={() => removeNode(n.id)} className="w-5 h-5 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
                        <Icon name="X" size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MindMapBuilder;
