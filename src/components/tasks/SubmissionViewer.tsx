import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Submission, submissionsApi } from '@/lib/api';
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
import TcoRoiBuilder from './TcoRoiBuilder';
import CustomerSatisfactionBuilder from './CustomerSatisfactionBuilder';
import { TaskType, courses } from '@/data/course';

interface Props {
  submission: Submission | null;
  onOpenChange: (v: boolean) => void;
  isTeacher: boolean;
  onReviewed?: () => void;
}

const noop = () => {};

const getTaskType = (taskKey: string): TaskType => {
  for (const course of courses) {
    const lesson = course.lessons.find((l) => l.taskKey === taskKey);
    if (lesson) return lesson.taskType;
  }
  return 'mindmap';
};

const statusLabel: Record<string, { label: string; color: string; icon: string }> = {
  in_progress: { label: 'В процессе', color: 'text-amber-300 bg-amber-400/15', icon: 'Pencil' },
  submitted: { label: 'На проверке', color: 'text-cyan-300 bg-cyan-400/15', icon: 'Send' },
  reviewed: { label: 'Проверено', color: 'text-emerald-300 bg-emerald-400/15', icon: 'CheckCheck' },
  needs_revision: { label: 'На доработке', color: 'text-orange-300 bg-orange-400/15', icon: 'RotateCcw' },
};

const SubmissionViewer = ({ submission, onOpenChange, isTeacher, onReviewed }: Props) => {
  const [grade, setGrade] = useState(submission?.grade?.toString() || '');
  const [comment, setComment] = useState(submission?.teacher_comment || '');
  const [saving, setSaving] = useState<'reviewed' | 'needs_revision' | null>(null);

  if (!submission) return null;
  const taskType = getTaskType(submission.task_key);
  const status = statusLabel[submission.status];

  const renderBuilder = () => {
    const props = { value: submission.content as never, onChange: noop, readOnly: true };
    switch (taskType) {
      case 'mindmap':
        return <MindMapBuilder {...props} />;
      case 'baccm':
        return <BaccmBuilder {...props} />;
      case 'stakeholders':
        return <StakeholderMatrixBuilder {...props} />;
      case 'smart':
        return <SmartGoalsBuilder {...props} />;
      case 'persona':
        return <PersonaBuilder {...props} />;
      case 'gantt':
        return <GanttChartBuilder {...props} />;
      case 'risks':
        return <RiskRegisterBuilder {...props} />;
      case 'raci':
        return <RaciMatrixBuilder {...props} />;
      case 'kanban':
        return <KanbanBuilder {...props} />;
      case 'kpi':
        return <KpiTableBuilder {...props} />;
      case 'tcoroi':
        return <TcoRoiBuilder {...props} />;
      case 'csi':
        return <CustomerSatisfactionBuilder {...props} />;
      default:
        return null;
    }
  };

  const submitReview = async (status: 'reviewed' | 'needs_revision') => {
    setSaving(status);
    try {
      const gradeNum = grade.trim() ? parseInt(grade, 10) : null;
      await submissionsApi.review(submission.id, gradeNum, comment, status);
      toast.success(status === 'reviewed' ? 'Оценка сохранена' : 'Работа возвращена студенту на доработку');
      onReviewed?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить оценку');
    } finally {
      setSaving(null);
    }
  };

  return (
    <Dialog open={!!submission} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border rounded-3xl p-0">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="font-display font-extrabold text-2xl mb-1">{submission.task_title}</h2>
              {isTeacher && (
                <p className="text-sm text-muted-foreground">
                  {submission.student_name} · {submission.student_email}
                </p>
              )}
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
              <Icon name={status.icon} size={13} />
              {status.label}
            </span>
          </div>

          <div className="mb-6">{renderBuilder()}</div>

          {isTeacher ? (
            <div className="rounded-2xl border border-border bg-secondary/20 p-5">
              <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Icon name="GraduationCap" size={16} className="text-primary" />
                Оценка работы
              </h4>
              <div className="flex gap-3 mb-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Балл (0-100)"
                  className="w-40 h-10 px-3 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary"
                />
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий студенту..."
                className="min-h-[90px] bg-card border-border resize-none text-sm mb-4"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => submitReview('reviewed')}
                  disabled={saving !== null}
                  className="flex-1 bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl"
                >
                  {saving === 'reviewed' ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Сохранить оценку'}
                </Button>
                <Button
                  onClick={() => submitReview('needs_revision')}
                  disabled={saving !== null}
                  variant="outline"
                  className="flex-1 border-orange-500/40 text-orange-300 hover:bg-orange-500/10 hover:text-orange-200 rounded-xl"
                >
                  {saving === 'needs_revision' ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Icon name="RotateCcw" size={15} className="mr-1.5" />
                      Вернуть на доработку
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            (submission.status === 'reviewed' || submission.status === 'needs_revision') && (
              <div className={`rounded-2xl border p-5 ${submission.status === 'needs_revision' ? 'border-orange-500/30 bg-orange-500/5' : 'border-primary/30 bg-primary/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display font-bold text-sm flex items-center gap-2">
                    <Icon name={submission.status === 'needs_revision' ? 'RotateCcw' : 'MessageSquare'} size={16} className={submission.status === 'needs_revision' ? 'text-orange-300' : 'text-primary'} />
                    {submission.status === 'needs_revision' ? 'Работа возвращена на доработку' : 'Отзыв преподавателя'}
                  </h4>
                  {submission.grade !== null && (
                    <span className="font-display font-extrabold text-lg text-gradient">{submission.grade}/100</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {submission.teacher_comment || 'Комментариев нет'}
                </p>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionViewer;