import { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { submissionsApi } from '@/lib/api';
import { TaskType } from '@/data/course';
import { toast } from 'sonner';
import MindMapBuilder from './MindMapBuilder';
import BaccmBuilder from './BaccmBuilder';
import StakeholderMatrixBuilder from './StakeholderMatrixBuilder';
import SmartGoalsBuilder from './SmartGoalsBuilder';
import PersonaBuilder from './PersonaBuilder';

interface Props {
  taskType: TaskType;
  taskKey: string;
  taskTitle: string;
  onSubmitted?: () => void;
}

type Status = 'idle' | 'saving' | 'saved';

const TaskWorkspace = ({ taskType, taskKey, taskTitle, onSubmitted }: Props) => {
  const { user } = useAuth();
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'in_progress' | 'submitted' | 'reviewed' | null>(null);
  const [saveStatus, setSaveStatus] = useState<Status>('idle');
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    submissionsApi
      .list(taskKey)
      .then((data) => {
        const existing = data.submissions?.[0];
        if (existing) {
          setContent(existing.content);
          setSubmissionStatus(existing.status);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [taskKey, user]);

  const persist = useCallback(
    (next: Record<string, unknown>, status: 'in_progress' | 'submitted') => {
      if (!user) return;
      setSaveStatus('saving');
      submissionsApi
        .save(taskKey, taskTitle, next, status)
        .then(() => {
          setSaveStatus('saved');
          setSubmissionStatus(status);
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
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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
