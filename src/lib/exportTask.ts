import type { TaskType } from '@/data/course';
import type { MindMapData } from '@/components/tasks/MindMapBuilder';
import type { BaccmData } from '@/components/tasks/BaccmBuilder';
import type { StakeholderMatrixData } from '@/components/tasks/StakeholderMatrixBuilder';
import type { SmartGoalsData } from '@/components/tasks/SmartGoalsBuilder';
import type { PersonaData } from '@/components/tasks/PersonaBuilder';
import type { GanttData } from '@/components/tasks/GanttChartBuilder';
import type { RiskRegisterData } from '@/components/tasks/RiskRegisterBuilder';
import type { RaciData } from '@/components/tasks/RaciMatrixBuilder';
import type { KanbanBoardData } from '@/components/tasks/KanbanBuilder';
import type { KpiTableData } from '@/components/tasks/KpiTableBuilder';
import type { TcoRoiData } from '@/components/tasks/TcoRoiBuilder';
import type { CsiData } from '@/components/tasks/CustomerSatisfactionBuilder';

type Row = (string | number)[];

interface ExportSection {
  title: string;
  intro?: string[];
  headers?: string[];
  rows: Row[];
  notes?: string[];
}

const levelRu: Record<string, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
const levelValue: Record<string, number> = { high: 3, medium: 2, low: 1 };

const riskLevel = (damage: string, probability: string) => {
  const score = (levelValue[damage] || 0) * (levelValue[probability] || 0);
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
};

const num = (v: string | number | undefined) => {
  const n = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const buildSections = (taskType: TaskType, content: Record<string, unknown>): ExportSection[] => {
  switch (taskType) {
    case 'mindmap': {
      const d = content as unknown as MindMapData;
      const sections: ExportSection[] = [];
      const methodLabel = { mindmap: 'Интеллект-карта', focal: 'Метод фокальных объектов', homunculus: 'Метод маленьких человечков' }[d.method] || d.method;
      if (d.nodes?.length) {
        sections.push({
          title: 'Интеллект-карта',
          intro: [`Выбранный метод: ${methodLabel}`],
          headers: ['Идея', 'Родительская идея'],
          rows: d.nodes.map((n) => [n.text || '—', d.nodes.find((p) => p.id === n.parentId)?.text || '—']),
        });
      }
      if (d.focal && (d.focal.object || d.focal.randomObjects || d.focal.properties || d.focal.ideas)) {
        sections.push({
          title: 'Метод фокальных объектов',
          headers: ['Параметр', 'Значение'],
          rows: [
            ['Фокальный объект', d.focal.object || ''],
            ['Случайные объекты', d.focal.randomObjects || ''],
            ['Свойства и признаки', d.focal.properties || ''],
            ['Новые идеи', d.focal.ideas || ''],
          ],
        });
      }
      if (d.homunculus && (d.homunculus.systemName || d.homunculus.humanoids?.length)) {
        sections.push({
          title: 'Метод маленьких человечков',
          intro: d.homunculus.systemName ? [`Система: ${d.homunculus.systemName}`] : [],
          headers: ['Роль', 'Описание'],
          rows: (d.homunculus.humanoids || []).map((h) => [h.role || '—', h.description || '—']),
        });
      }
      return sections.length ? sections : [{ title: 'Идея проекта', rows: [], intro: [`Выбранный метод: ${methodLabel}`] }];
    }
    case 'baccm': {
      const d = content as unknown as BaccmData;
      return [
        {
          title: 'BACCM Canvas',
          headers: ['Элемент', 'Описание'],
          rows: [
            ['Потребность (Need)', d.need || ''],
            ['Изменение (Change)', d.change || ''],
            ['Решение (Solution)', d.solution || ''],
            ['Заинтересованные стороны (Stakeholders)', d.stakeholders || ''],
            ['Ценность (Value)', d.value || ''],
            ['Контекст (Context)', d.context || ''],
          ],
        },
      ];
    }
    case 'stakeholders': {
      const d = content as unknown as StakeholderMatrixData;
      return [
        {
          title: 'Матрица стейкхолдеров',
          headers: ['Название', 'Роль', 'Группа', 'Влияние', 'Интерес', 'Стратегия взаимодействия'],
          rows: (d.stakeholders || []).map((s) => [
            s.name || '',
            s.role || '',
            s.group === 'consumer' ? 'Потребители' : 'Другие интересанты',
            levelRu[s.influence] || s.influence,
            levelRu[s.interest] || s.interest,
            s.strategy || '',
          ]),
        },
      ];
    }
    case 'smart': {
      const d = content as unknown as SmartGoalsData;
      return [
        {
          title: 'SMART-цели',
          headers: ['#', 'Полная формулировка', 'S — конкретная', 'M — измеримая', 'A — достижимая', 'R — значимая', 'T — ограничена во времени', 'Мероприятия по достижению'],
          rows: (d.goals || []).map((g, i) => [i + 1, g.fullGoal || '', g.specific || '', g.measurable || '', g.achievable || '', g.relevant || '', g.timeBound || '', g.actions || '']),
        },
      ];
    }
    case 'persona': {
      const d = content as unknown as PersonaData;
      return [
        {
          title: 'Карточки персон',
          headers: ['Имя', 'Роль', 'Возраст/город', 'Сегмент', 'Описание персоны', 'Чем пользуется сейчас', 'Цели', 'Боли и трудности'],
          rows: (d.personas || []).map((p) => [p.name || '', p.role || '', p.age || '', p.segment || '', p.description || '', p.currentTools || '', p.goals || '', p.painPoints || '']),
        },
      ];
    }
    case 'gantt': {
      const d = content as unknown as GanttData;
      return [
        {
          title: 'Диаграмма Ганта',
          headers: ['Этап', 'Начало', 'Окончание', 'Ответственный'],
          rows: (d.stages || []).map((s) => [
            s.name || '',
            s.start ? new Date(s.start).toLocaleDateString('ru-RU') : '',
            s.end ? new Date(s.end).toLocaleDateString('ru-RU') : '',
            s.responsible || '',
          ]),
        },
      ];
    }
    case 'risks': {
      const d = content as unknown as RiskRegisterData;
      return [
        {
          title: 'Реестр рисков проекта',
          headers: ['Этап', 'Описание риска', 'Возможные последствия', 'Ущерб', 'Вероятность', 'Уровень риска', 'Мероприятия по снижению', 'Владелец риска'],
          rows: (d.risks || []).map((r) => [
            r.stage || '',
            r.description || '',
            r.consequences || '',
            levelRu[r.damage] || r.damage,
            levelRu[r.probability] || r.probability,
            levelRu[riskLevel(r.damage, r.probability)],
            r.measures || '',
            r.owner || '',
          ]),
        },
      ];
    }
    case 'raci': {
      const d = content as unknown as RaciData;
      const participants = d.participants || [];
      return [
        {
          title: 'Матрица ответственности RACI',
          headers: ['Работа / этап проекта', ...participants.map((p) => p.name || 'Участник')],
          rows: (d.tasks || []).map((t) => [t.name || '', ...participants.map((p) => t.roles[p.id] || '—')]),
          notes: ['R — Responsible (исполнитель), A — Accountable (ответственный), C — Consulted (консультирует), I — Informed (информируется)'],
        },
      ];
    }
    case 'kanban': {
      const d = content as unknown as KanbanBoardData;
      const rows: Row[] = [];
      (d.columns || []).forEach((c) => {
        (c.cards || []).forEach((card) => rows.push([c.title, card.text]));
      });
      return [
        {
          title: 'Канбан-доска',
          headers: ['Статус', 'Задача'],
          rows,
        },
      ];
    }
    case 'kpi': {
      const d = content as unknown as KpiTableData;
      const workers = d.workers || [];
      const kpi1 = (t: number, time: number) => (time > 0 ? (t / time).toFixed(2) : '—');
      const kpi2 = (t: number, err: number) => (t > 0 ? (((t - err) / t) * 100).toFixed(0) + '%' : '—');
      const totalTasks = workers.reduce((s, w) => s + num(w.tasksDone), 0);
      const totalTime = workers.reduce((s, w) => s + num(w.avgTime), 0);
      const totalErrors = workers.reduce((s, w) => s + num(w.criticalErrors), 0);
      const kpi3 = totalTime > 0 ? (totalTasks / totalTime).toFixed(2) : '—';
      const kpi4 = totalTasks > 0 ? (((totalTasks - totalErrors) / totalTasks) * 100).toFixed(0) + '%' : '—';
      return [
        {
          title: 'KPI сотрудников проекта',
          headers: ['Работник (роль)', 'Выполнено задач', 'Среднее время, ч', 'Критических ошибок', 'KPI1', 'KPI2'],
          rows: [
            ...workers.map((w) => [w.name || '', w.tasksDone || '', w.avgTime || '', w.criticalErrors || '', kpi1(num(w.tasksDone), num(w.avgTime)), kpi2(num(w.tasksDone), num(w.criticalErrors))]),
            ['ВСЕГО', totalTasks, totalTime, totalErrors, `KPI3: ${kpi3}`, `KPI4: ${kpi4}`],
          ],
          notes: d.conclusions ? [d.conclusions] : [],
        },
      ];
    }
    case 'tcoroi': {
      const d = content as unknown as TcoRoiData;
      const years = Math.max(num(d.years) || 5, 1);
      const sumItems = (items: { name: string; value: string }[]) => items.reduce((s, it) => s + num(it.value), 0);
      const directCosts = sumItems(d.initialCosts || []);
      const annualCostsTotal = sumItems(d.annualCosts || []);
      const tco = directCosts + annualCostsTotal * years;
      const annualBenefit = sumItems(d.benefits || []);
      const totalBenefits = annualBenefit * years;
      const roi = tco > 0 ? ((totalBenefits - tco) / tco) * 100 : 0;
      const itemRows = (items: { name: string; value: string }[]) => items.map((it) => [it.name || '', num(it.value)]);
      return [
        { title: 'Первоначальные инвестиции (прямые затраты)', headers: ['Статья затрат', 'Сумма, ₽'], rows: itemRows(d.initialCosts || []) },
        { title: 'Ежегодные эксплуатационные расходы (косвенные затраты)', headers: ['Статья затрат', 'Сумма, ₽ в год'], rows: itemRows(d.annualCosts || []) },
        { title: 'Выгоды от реализации проекта', headers: ['Статья выгоды', 'Сумма, ₽ в год'], rows: itemRows(d.benefits || []) },
        {
          title: 'Итоги расчёта TCO и ROI',
          headers: ['Показатель', 'Значение'],
          rows: [
            ['Горизонт расчёта, лет', years],
            [`TCO за ${years} лет, ₽`, Math.round(tco)],
            [`Общие выгоды за ${years} лет, ₽`, Math.round(totalBenefits)],
            ['ROI, %', roi.toFixed(1)],
          ],
          notes: d.conclusion ? [d.conclusion] : [],
        },
      ];
    }
    case 'csi': {
      const d = content as unknown as CsiData;
      const criteria = d.criteria || [];
      const services = d.services || [];
      const respondents = d.respondents || [];
      const avgOf = (scores: Record<string, Record<string, string>>, critId: string, entities: { id: string }[]) => {
        const vals = entities.map((e) => num(scores[critId]?.[e.id])).filter((v) => v > 0);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      };
      const refTable: ExportSection = {
        title: 'Эталонная (целевая) оценка',
        headers: ['Критерий', ...services.map((s) => s.name), 'Среднее εj'],
        rows: criteria.map((c) => [c.name, ...services.map((s) => d.refScores[c.id]?.[s.id] || ''), avgOf(d.refScores, c.id, services).toFixed(2)]),
      };
      const actTable: ExportSection = {
        title: 'Лист оценки удовлетворённости потребителя',
        headers: ['Критерий', ...respondents.map((r) => r.name), 'Среднее kj'],
        rows: criteria.map((c) => [c.name, ...respondents.map((r) => d.actualScores[c.id]?.[r.id] || ''), avgOf(d.actualScores, c.id, respondents).toFixed(2)]),
      };
      const ratios = criteria.map((c) => {
        const ref = avgOf(d.refScores, c.id, services);
        const act = avgOf(d.actualScores, c.id, respondents);
        return ref > 0 ? act / ref : null;
      });
      const validRatios = ratios.filter((r): r is number => r !== null);
      const k1 = validRatios.length ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length : 0;
      const summary: ExportSection = {
        title: 'Отчёт по результатам оценки удовлетворённости',
        headers: ['Критерий', 'kj (оценка)', 'εj (эталон)', 'kj / εj'],
        rows: criteria.map((c, i) => [
          c.name,
          avgOf(d.actualScores, c.id, respondents).toFixed(2),
          avgOf(d.refScores, c.id, services).toFixed(2),
          ratios[i] !== null ? ratios[i]!.toFixed(2) : '—',
        ]),
        notes: [
          `Показатель удовлетворённости потребителя K1 = ${k1.toFixed(2)} (${k1 >= 1 ? 'потребитель удовлетворён результатом' : 'потребитель не удовлетворён, требуются корректирующие мероприятия'})`,
          ...(d.conclusion ? [d.conclusion] : []),
        ],
      };
      return [refTable, actTable, summary];
    }
    default:
      return [];
  }
};

const sanitizeFilename = (name: string) => name.replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 120) || 'Задание';

const sanitizeSheetName = (name: string, index: number) => {
  const clean = name.replace(/[\\/:*?[\]]+/g, ' ').trim();
  return (clean || `Лист ${index + 1}`).slice(0, 31);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const exportToDocx = async (title: string, sections: ExportSection[]) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = await import('docx');
  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE, spacing: { after: 300 } }),
  ];

  sections.forEach((sec) => {
    children.push(new Paragraph({ text: sec.title, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }));
    (sec.intro || []).forEach((p) => children.push(new Paragraph({ children: [new TextRun(p)], spacing: { after: 100 } })));

    if (sec.rows.length && sec.headers) {
      const headerRow = new TableRow({
        tableHeader: true,
        children: sec.headers.map(
          (h) =>
            new TableCell({
              shading: { fill: 'EFEAFB' },
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
            })
        ),
      });
      const bodyRows = sec.rows.map(
        (r) =>
          new TableRow({
            children: r.map((cell) => new TableCell({ children: [new Paragraph(String(cell ?? ''))] })),
          })
      );
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] }));
    }

    (sec.notes || []).forEach((p) => children.push(new Paragraph({ children: [new TextRun(p)], spacing: { before: 150 } })));
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${sanitizeFilename(title)}.docx`);
};

const exportToXlsx = async (title: string, sections: ExportSection[]) => {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  sections.forEach((sec, i) => {
    const aoa: (string | number)[][] = [];
    (sec.intro || []).forEach((p) => aoa.push([p]));
    if (sec.intro?.length) aoa.push([]);
    if (sec.headers) aoa.push(sec.headers);
    aoa.push(...sec.rows);
    if (sec.notes?.length) {
      aoa.push([]);
      sec.notes.forEach((p) => aoa.push([p]));
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa.length ? aoa : [['Нет данных']]);
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sec.title, i));
  });

  if (!sections.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Нет данных']]), 'Лист 1');
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([wbout], { type: 'application/octet-stream' }), `${sanitizeFilename(title)}.xlsx`);
};

export const exportTask = async (taskType: TaskType, taskTitle: string, content: Record<string, unknown> | null, format: 'docx' | 'xlsx') => {
  const sections = content ? buildSections(taskType, content) : [];
  if (format === 'docx') {
    await exportToDocx(taskTitle, sections);
  } else {
    await exportToXlsx(taskTitle, sections);
  }
};