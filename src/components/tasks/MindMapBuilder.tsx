import { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  color: string;
}

interface Homunculus {
  id: string;
  role: string;
  description: string;
}

export interface MindMapData {
  method: 'mindmap' | 'focal' | 'homunculus';
  nodes: Node[];
  focal: {
    object: string;
    randomObjects: string;
    properties: string;
    ideas: string;
  };
  homunculus: {
    systemName: string;
    humanoids: Homunculus[];
  };
}

const COLORS = ['#a78bfa', '#f472b6', '#22d3ee', '#fbbf24', '#34d399'];

const emptyHomunculus = (): Homunculus => ({ id: `h${Date.now()}${Math.random()}`, role: '', description: '' });

const defaultData = (): MindMapData => ({
  method: 'mindmap',
  nodes: [{ id: 'root', text: 'Идея проекта', x: 400, y: 220, parentId: null, color: '#a78bfa' }],
  focal: { object: '', randomObjects: '', properties: '', ideas: '' },
  homunculus: { systemName: '', humanoids: [emptyHomunculus(), emptyHomunculus()] },
});

const methods: { key: MindMapData['method']; label: string; icon: string }[] = [
  { key: 'mindmap', label: 'Интеллект-карта', icon: 'GitBranch' },
  { key: 'focal', label: 'Метод фокальных объектов', icon: 'Shuffle' },
  { key: 'homunculus', label: 'Метод маленьких человечков', icon: 'Users' },
];

interface Props {
  value: MindMapData | null;
  onChange: (v: MindMapData) => void;
  readOnly?: boolean;
}

const MindMapBuilder = ({ value, onChange, readOnly }: Props) => {
  const initial: MindMapData = value && (value.nodes?.length || value.focal || value.homunculus)
    ? { ...defaultData(), ...value }
    : defaultData();
  const [data, setData] = useState<MindMapData>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = (next: MindMapData) => {
    setData(next);
    onChange(next);
  };

  const setMethod = (method: MindMapData['method']) => update({ ...data, method });

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
    update({ ...data, nodes: [...data.nodes, newNode] });
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
    update({ ...data, nodes: data.nodes.filter((n) => !idsToRemove.has(n.id)) });
  };

  const renameNode = (id: string, text: string) => {
    update({ ...data, nodes: data.nodes.map((n) => (n.id === id ? { ...n, text } : n)) });
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
      setData((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (n.id === dragId ? { ...n, x, y } : n)) }));
    },
    [dragId]
  );

  const onMouseUp = () => {
    if (dragId) onChange(data);
    setDragId(null);
  };

  const setFocalField = (key: keyof MindMapData['focal'], text: string) => {
    update({ ...data, focal: { ...data.focal, [key]: text } });
  };

  const setSystemName = (text: string) => {
    update({ ...data, homunculus: { ...data.homunculus, systemName: text } });
  };

  const updateHumanoid = (id: string, key: keyof Homunculus, text: string) => {
    update({
      ...data,
      homunculus: { ...data.homunculus, humanoids: data.homunculus.humanoids.map((h) => (h.id === id ? { ...h, [key]: text } : h)) },
    });
  };

  const addHumanoid = () => {
    update({ ...data, homunculus: { ...data.homunculus, humanoids: [...data.homunculus.humanoids, emptyHomunculus()] } });
  };

  const removeHumanoid = (id: string) => {
    update({ ...data, homunculus: { ...data.homunculus, humanoids: data.homunculus.humanoids.filter((h) => h.id !== id) } });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {methods.map((m) => (
          <button
            key={m.key}
            onClick={() => !readOnly && setMethod(m.key)}
            disabled={readOnly && data.method !== m.key}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              data.method === m.key
                ? 'bg-gradient-brand text-white'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground'
            }`}
          >
            <Icon name={m.icon} size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {data.method === 'mindmap' && (
        <div className="rounded-2xl border border-border bg-secondary/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/40">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Icon name="MousePointer2" size={13} />
              Перетаскивайте узлы, нажмите + чтобы добавить идею
            </span>
            {!readOnly && (
              <Button size="sm" variant="ghost" onClick={() => update({ ...data, nodes: defaultData().nodes })} className="h-7 text-xs text-muted-foreground">
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
      )}

      {data.method === 'focal' && (
        <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" size={13} />
            К вашему проекту «примеряют» случайные свойства других объектов — так рождаются неожиданные идеи.
          </p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Icon name="Target" size={12} /> Фокальный объект (ваш проект)
            </label>
            <Input
              value={data.focal.object}
              onChange={(e) => setFocalField('object', e.target.value)}
              readOnly={readOnly}
              placeholder="Например: мобильное приложение для доставки еды"
              className="h-10 text-sm bg-card/60 border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Icon name="Shuffle" size={12} /> Случайные объекты (3–4 любых предмета)
            </label>
            <Input
              value={data.focal.randomObjects}
              onChange={(e) => setFocalField('randomObjects', e.target.value)}
              readOnly={readOnly}
              placeholder="Например: будильник, аквариум, зонт, лифт"
              className="h-10 text-sm bg-card/60 border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Icon name="ListPlus" size={12} /> Их свойства и признаки
            </label>
            <Textarea
              value={data.focal.properties}
              onChange={(e) => setFocalField('properties', e.target.value)}
              readOnly={readOnly}
              placeholder="Например: будильник — будит вовремя; аквариум — прозрачный, живой; зонт — защищает; лифт — перемещает между уровнями"
              className="min-h-[80px] text-sm bg-card/60 border-border resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Icon name="Lightbulb" size={12} /> Новые идеи из сочетаний
            </label>
            <Textarea
              value={data.focal.ideas}
              onChange={(e) => setFocalField('ideas', e.target.value)}
              readOnly={readOnly}
              placeholder="Например: приложение «будит» напоминанием о заказе; «прозрачный» трекинг курьера в реальном времени"
              className="min-h-[100px] text-sm bg-card/60 border-border resize-none"
            />
          </div>
        </div>
      )}

      {data.method === 'homunculus' && (
        <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" size={13} />
            Представьте систему как множество «человечков» — каждый выполняет свою роль. Это помогает найти узкие места.
          </p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Icon name="Box" size={12} /> Название системы (ваш проект)
            </label>
            <Input
              value={data.homunculus.systemName}
              onChange={(e) => setSystemName(e.target.value)}
              readOnly={readOnly}
              placeholder="Например: платформа онлайн-обучения"
              className="h-10 text-sm bg-card/60 border-border"
            />
          </div>
          <div className="space-y-3">
            {data.homunculus.humanoids.map((h, i) => (
              <div key={h.id} className="rounded-xl border border-border bg-card/40 p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-gradient-brand text-white flex items-center justify-center text-[10px]">{i + 1}</span>
                    Человечек {i + 1}
                  </span>
                  {!readOnly && data.homunculus.humanoids.length > 1 && (
                    <button onClick={() => removeHumanoid(h.id)} className="text-muted-foreground hover:text-destructive">
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <Input
                    value={h.role}
                    onChange={(e) => updateHumanoid(h.id, 'role', e.target.value)}
                    readOnly={readOnly}
                    placeholder="Роль (напр. «человечки-модераторы»)"
                    className="h-9 text-sm bg-card/60 border-border"
                  />
                  <Input
                    value={h.description}
                    onChange={(e) => updateHumanoid(h.id, 'description', e.target.value)}
                    readOnly={readOnly}
                    placeholder="Что делают, за что отвечают"
                    className="h-9 text-sm bg-card/60 border-border"
                  />
                </div>
              </div>
            ))}
          </div>
          {!readOnly && (
            <Button variant="outline" onClick={addHumanoid} className="w-full border-dashed rounded-xl">
              <Icon name="UserPlus" size={15} className="mr-1.5" /> Добавить человечка
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MindMapBuilder;
