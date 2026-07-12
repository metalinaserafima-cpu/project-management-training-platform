import { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { submissionsApi } from '@/lib/api';
import { TaskType } from '@/data/course';
import { toast } from 'sonner';
import MindMapBuilder from './MindMapBuilder';
import BaccmBuilder from './BaccmBuilder';
import StakeholderMatrixBuilder from './StakeholderMatrixBuilder';
import SmartGoalsBuilder from './SmartGoalsBuilder';
import PersonaBuilder from './PersonaBuilder';
import GanttChartBuilder from './GanttChartBuilder';
import RiskRegisterBuilder from './RiskRegisterBuilder';
import RaciMatrixBuilder from './RaciMatrixBuilder';
import KanbanBuilder from './KanbanBuilder';
import KpiTableBuilder from './KpiTableBuilder';

interface Props {
  taskType: TaskType;
  taskKey: string;
  taskTitle: string;
  onSubmitted?: () => void;
}

type Status = 'idle' | 'saving' | 'saved';
type SubmissionStatus = 'in_progress' | 'submitted' | 'reviewed' | 'needs_revision';

const TaskWorkspace = ({ taskType, taskKey, taskTitle, onSubmitted }: Props) => {
  const { user } = useAuth();
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);
  const [teacherComment, setTeacherComment] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Status>('idle');
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    submissionsApi
      .list(taskKey)
      .then((data) => {
        const existing = data.submissions?.[0];
        if (existing) {
          setSubmissionId(existing.id);
          setContent(existing.content);
          setSubmissionStatus(existing.status);
          setTeacherComment(existing.teacher_comment);
        } else {
          setSubmissionId(null);
          setContent(null);
          setSubmissionStatus(null);
          setTeacherComment(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [taskKey, user]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    (next: Record<string, unknown>, status: 'in_progress' | 'submitted') => {
      if (!user) return;
      setSaveStatus('saving');
      submissionsApi
        .save(taskKey, taskTitle, next, status)
        .then((data) => {
          setSaveStatus('saved');
          setSubmissionStatus(status);
          if (data.submission?.id) setSubmissionId(data.submission.id);
        })
        .catch(() => setSaveStatus('idle'));
    },
    [taskKey, taskTitle, user]
  );

  const handleChange = (next: Record<string, unknown>) => {
    setContent(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(next, 'in_progress'), 900);
  };

  const submit = () => {
    if (!content) return;
    persist(content, 'submitted');
    toast.success('Работа отправлена преподавателю! Загляните на вкладку «Проекты» 🎉');
    onSubmitted?.();
  };

  const restart = async () => {
    if (!submissionId) {
      setContent(null);
      return;
    }
    setResetting(true);
    try {
      await submissionsApi.reset(submissionId);
      setSubmissionId(null);
      setContent(null);
      setSubmissionStatus(null);
      setTeacherComment(null);
      toast.success('Работа сброшена, можно начать заново');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сбросить работу');
    } finally {
      setResetting(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <Icon name="LogIn" size={28} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Войдите в аккаунт, чтобы выполнить задание и сохранить работу</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  const readOnly = submissionStatus === 'submitted' || submissionStatus === 'reviewed';

  const renderBuilder = () => {
    switch (taskType) {
      case 'mindmap':
        return <MindMapBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'baccm':
        return <BaccmBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'stakeholders':
        return <StakeholderMatrixBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'smart':
        return <SmartGoalsBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'persona':
        return <PersonaBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'gantt':
        return <GanttChartBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'risks':
        return <RiskRegisterBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'raci':
        return <RaciMatrixBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'kanban':
        return <KanbanBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      case 'kpi':
        return <KpiTableBuilder value={content as never} onChange={handleChange as never} readOnly={readOnly} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {submissionStatus === 'needs_revision' && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 mb-5">
          <div className="font-display font-semibold text-sm mb-1.5 flex items-center gap-2 text-amber-300">
            <Icon name="RotateCcw" size={16} />
            Преподаватель вернул работу на доработку
          </div>
          {teacherComment && <p className="text-sm text-muted-foreground leading-relaxed">{teacherComment}</p>}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5"><Icon name="Loader2" size={12} className="animate-spin" /> Сохранение...</span>
          )}
          {saveStatus === 'saved' && submissionStatus === 'in_progress' && (
            <span className="flex items-center gap-1.5 text-emerald-400"><Icon name="Check" size={12} /> Черновик сохранён</span>
          )}
          {submissionStatus === 'submitted' && (
            <span className="flex items-center gap-1.5 text-cyan-300"><Icon name="Send" size={12} /> Отправлено преподавателю</span>
          )}
          {submissionStatus === 'reviewed' && (
            <span className="flex items-center gap-1.5 text-amber-300"><Icon name="CheckCheck" size={12} /> Проверено преподавателем</span>
          )}
        </div>

        {(content || submissionStatus) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive text-xs h-8">
                <Icon name="RotateCcw" size={13} className="mr-1.5" />
                Начать заново
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Начать задание заново?</AlertDialogTitle>
                <AlertDialogDescription>
                  Весь прогресс по этому заданию будет удалён без возможности восстановления.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={restart} disabled={resetting} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                  {resetting ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Удалить и начать заново'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {renderBuilder()}

      {!readOnly && (
        <Button
          onClick={submit}
          className="w-full mt-5 bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl"
        >
          <Icon name="Send" size={16} className="mr-1.5" />
          Отправить преподавателю
        </Button>
      )}
    </div>
  );
};

export default TaskWorkspace;