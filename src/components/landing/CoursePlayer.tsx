import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Course } from '@/data/course';
import TaskWorkspace from '@/components/tasks/TaskWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  course: Course | null;
  onOpenChange: (v: boolean) => void;
}

const CoursePlayer = ({ course, onOpenChange }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!course) return null;
  const lesson = course.lessons[0];

  return (
    <Dialog open={!!course} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-card border-border rounded-3xl">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex items-center gap-3 shrink-0">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center`}>
              <Icon name={course.icon} size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base leading-snug truncate">{course.title}</h3>
              <div className="text-xs text-muted-foreground">{lesson.duration} · +{lesson.xp} XP</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-9">
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
              <p className="text-[15px] leading-relaxed mb-5">{lesson.task}</p>

              {!user ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center bg-card/40">
                  <Icon name="LogIn" size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Войдите, чтобы выполнить задание прямо здесь</p>
                  <Button
                    size="sm"
                    onClick={() => { onOpenChange(false); navigate('/auth'); }}
                    className="bg-gradient-brand border-0 rounded-xl"
                  >
                    Войти или зарегистрироваться
                  </Button>
                </div>
              ) : (
                <TaskWorkspace
                  taskType={lesson.taskType}
                  taskKey={lesson.taskKey}
                  taskTitle={lesson.title}
                  onSubmitted={() => {
                    toast.success(`Работа отправлена! +${lesson.xp} XP ⚡`);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoursePlayer;
