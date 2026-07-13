import Icon from '@/components/ui/icon';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Course } from '@/data/course';
import TaskWorkspace from '@/components/tasks/TaskWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  course: Course | null;
  onOpenChange: (v: boolean) => void;
  onSubmitted?: () => void;
}

const TaskConstructorModal = ({ course, onOpenChange, onSubmitted }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!course) return null;
  const lesson = course.lessons[0];

  return (
    <Dialog open={!!course} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden bg-card border-border rounded-3xl min-w-0">
        <div className="flex flex-col max-h-[90vh] min-w-0">
          <div className="p-5 border-b border-border flex items-center gap-3 shrink-0">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shrink-0`}>
              <Icon name={course.icon} size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base leading-snug truncate">{course.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{lesson.task}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-7 min-w-0">
            {!user ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/40">
                <Icon name="LogIn" size={28} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">Войдите, чтобы выполнить задание прямо здесь</p>
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
                  onSubmitted?.();
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskConstructorModal;