import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { initiationCourse } from '@/data/course';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const CoursePlayer = ({ open, onOpenChange }: Props) => {
  const course = initiationCourse;
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const lesson = course.lessons[current];
  const isDone = completed.includes(lesson.id);
  const progress = Math.round((completed.length / course.lessons.length) * 100);
  const totalXp = course.lessons.filter((l) => completed.includes(l.id)).reduce((s, l) => s + l.xp, 0);

  const complete = () => {
    if (!isDone) {
      setCompleted((p) => [...p, lesson.id]);
      const isLast = completed.length + 1 === course.lessons.length;
      toast.success(isLast ? `Курс пройден! +${lesson.xp} XP 🎓` : `Урок пройден! +${lesson.xp} XP ⚡`);
    }
    if (current < course.lessons.length - 1) setCurrent((c) => c + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-card border-border rounded-3xl">
        <div className="flex h-full flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border bg-secondary/30 flex flex-col">
            <div className="p-5 border-b border-border">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-3`}>
                <Icon name={course.icon} size={22} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-base leading-snug">{course.title}</h3>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Прогресс</span>
                  <span className="text-amber-300 font-semibold">{totalXp} XP</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {course.lessons.map((l, i) => {
                const done = completed.includes(l.id);
                const active = i === current;
                return (
                  <button
                    key={l.id}
                    onClick={() => setCurrent(i)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      active ? 'bg-gradient-brand/15 border border-primary/30' : 'hover:bg-secondary/60 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      done ? 'bg-emerald-500/20 text-emerald-300' : active ? 'bg-gradient-brand text-white' : 'bg-secondary text-muted-foreground'
                    }`}>
                      <Icon name={done ? 'Check' : l.icon} size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{l.title}</div>
                      <div className="text-[11px] text-muted-foreground">{l.duration} · {l.xp} XP</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6 md:p-9">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span>Урок {current + 1} из {course.lessons.length}</span>
                {isDone && (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Icon name="CheckCircle2" size={13} /> пройден
                  </span>
                )}
              </div>

              <h2 className="font-display font-extrabold text-2xl md:text-3xl mb-1.5">{lesson.title}</h2>
              <p className="text-muted-foreground mb-6">{lesson.subtitle}</p>

              <p className="text-[15px] leading-relaxed mb-7 p-4 rounded-2xl bg-secondary/40 border-l-2 border-primary">
                {lesson.intro}
              </p>

              <div className="space-y-5 mb-8">
                {lesson.blocks.map((b, i) => (
                  <div key={i}>
                    <h4 className="font-display font-bold text-base mb-1.5 flex items-center gap-2">
                      <span className="text-gradient">{String(i + 1).padStart(2, '0')}</span>
                      {b.heading}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-[15px]">{b.text}</p>
                  </div>
                ))}
              </div>

              {lesson.links.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-display font-bold text-sm uppercase tracking-wide text-muted-foreground mb-3">Материалы для изучения</h4>
                  <div className="space-y-2">
                    {lesson.links.map((lnk) => (
                      <a
                        key={lnk.url}
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors group"
                      >
                        <Icon name="Link" size={16} className="text-primary shrink-0" />
                        <span className="text-sm flex-1 group-hover:text-foreground">{lnk.label}</span>
                        <Icon name="ExternalLink" size={14} className="text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-gradient-brand/10 border border-primary/20 p-5">
                <h4 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                  <Icon name="ClipboardCheck" size={18} className="text-accent" />
                  Практическое задание
                </h4>
                <p className="text-[15px] leading-relaxed mb-4">{lesson.task}</p>
                <div className="flex flex-wrap gap-2">
                  {lesson.tools.map((t) => (
                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div className="border-t border-border p-4 flex items-center justify-between gap-3 bg-card">
              <Button
                variant="ghost"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                className="text-muted-foreground disabled:opacity-30"
              >
                <Icon name="ArrowLeft" size={16} className="mr-1" /> Назад
              </Button>

              <Button
                onClick={complete}
                className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl px-6"
              >
                {isDone
                  ? current === course.lessons.length - 1 ? 'Завершить' : 'Следующий урок'
                  : current === course.lessons.length - 1 ? 'Пройти и завершить' : 'Пройти урок'}
                <Icon name="ArrowRight" size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoursePlayer;
