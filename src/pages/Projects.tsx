import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { submissionsApi, statsApi, Submission, StudentProgress } from '@/lib/api';
import SubmissionViewer from '@/components/tasks/SubmissionViewer';
import TaskConstructorModal from '@/components/tasks/TaskConstructorModal';
import { courses, Course } from '@/data/course';
import { toast } from 'sonner';

const statusMeta: Record<string, { label: string; color: string; icon: string }> = {
  in_progress: { label: 'В процессе', color: 'text-amber-300 bg-amber-400/15', icon: 'Pencil' },
  submitted: { label: 'На проверке', color: 'text-cyan-300 bg-cyan-400/15', icon: 'Send' },
  reviewed: { label: 'Проверено', color: 'text-emerald-300 bg-emerald-400/15', icon: 'CheckCheck' },
  needs_revision: { label: 'На доработке', color: 'text-orange-300 bg-orange-400/15', icon: 'RotateCcw' },
};

const filters = [
  { key: 'all', label: 'Все' },
  { key: 'submitted', label: 'На проверке' },
  { key: 'reviewed', label: 'Проверено' },
  { key: 'needs_revision', label: 'На доработке' },
  { key: 'in_progress', label: 'В процессе' },
];

const constructorLabel: Record<string, string> = {
  mindmap: 'Конструктор: 3 метода ТРИЗ',
  baccm: 'Конструктор: форма BACCM',
  stakeholders: 'Конструктор: карта стейкхолдеров',
  smart: 'Конструктор: SMART-цели',
  persona: 'Конструктор: карточки персон',
  gantt: 'Конструктор: диаграмма Ганта',
  risks: 'Конструктор: реестр рисков',
  raci: 'Конструктор: матрица RACI',
  kanban: 'Конструктор: Канбан-доска',
  kpi: 'Конструктор: таблица KPI',
  tcoroi: 'Конструктор: TCO и ROI',
  csi: 'Конструктор: удовлетворённость потребителя',
};

const Projects = () => {
  const { user, updateProfile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [openCourse, setOpenCourse] = useState<Course | null>(null);
  const [fullName, setFullName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    submissionsApi
      .list()
      .then((data) => setSubmissions(data.submissions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.role !== 'teacher') return;
    statsApi
      .get()
      .then((data) => setStudentsProgress(data.students_progress || []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setFullName(user?.full_name || '');
    setGroupName(user?.group_name || '');
  }, [user]);

  const handleSaveProfile = async () => {
    if (!fullName.trim() || !groupName.trim()) {
      toast.error('Заполните ФИО и номер группы');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile(fullName.trim(), groupName.trim());
      toast.success('Данные сохранены');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить данные');
    } finally {
      setSavingProfile(false);
    }
  };

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);
  const isTeacher = user?.role === 'teacher';

  const submittedTaskKeys = new Set(submissions.map((s) => s.task_key));

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-brand flex items-center justify-center glow shrink-0">
              <Icon name="Puzzle" size={40} className="text-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-4xl leading-none block">
                Pro<span className="text-gradient">Puzzle</span>
              </span>
              <span className="text-sm text-muted-foreground">Собери свой проект</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/design-docs">
              <Button variant="ghost" className="text-muted-foreground">
                <Icon name="FileText" size={16} className="mr-1.5" /> Зачётное задание
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-muted-foreground">
                <Icon name="ArrowLeft" size={16} className="mr-1.5" /> На главную
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="mb-10">
          <span className="text-sm font-semibold text-gradient uppercase tracking-widest">
            {isTeacher ? 'Кабинет преподавателя' : 'Личный кабинет'}
          </span>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-2">
            {isTeacher ? 'Работы студентов' : 'Мои проекты'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isTeacher
              ? 'Здесь появляются все выполненные задания студентов по курсам'
              : 'Выполняйте задания курсов прямо здесь и следите за статусом проверки'}
          </p>
        </div>

        {isTeacher && (
          <div className="glass rounded-2xl p-5 mb-10">
            <h2 className="font-display font-bold text-base mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" size={18} className="text-primary" />
              Прогресс студентов по курсам
            </h2>
            {studentsProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока нет зарегистрированных студентов</p>
            ) : (
              <div className="space-y-3">
                {studentsProgress.map((s) => {
                  const percent = Math.round((s.total_completed_count / courses.length) * 100);
                  return (
                    <div key={s.user_id} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center font-display font-bold text-sm shrink-0">
                        {(s.full_name || s.name).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {s.full_name || s.name}
                            {s.group_name && <span className="text-muted-foreground font-normal"> · гр. {s.group_name}</span>}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">{s.total_completed_count} / {courses.length}</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!isTeacher && (
          <div className="glass rounded-2xl p-5 mb-10">
            <h2 className="font-display font-bold text-base mb-4 flex items-center gap-2">
              <Icon name="IdCard" size={18} className="text-primary" />
              Данные студента
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">ФИО</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  className="h-10 bg-secondary/40 border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Номер группы</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Например: ПМ-21"
                  className="h-10 bg-secondary/40 border-border"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl"
            >
              {savingProfile ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Сохранить'}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              ФИО и группа будут видны преподавателю при отправке заданий на проверку и в рейтинге на главной странице.
            </p>
          </div>
        )}

        {!isTeacher && (
          <div className="mb-14">
            <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
              <Icon name="PenTool" size={20} className="text-primary" />
              Выполнить задание
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => {
                const taskKey = c.lessons[0].taskKey;
                const done = submittedTaskKeys.has(taskKey);
                return (
                  <button
                    key={c.id}
                    onClick={() => setOpenCourse(c)}
                    className="text-left glass rounded-2xl p-5 hover:border-primary/40 hover:-translate-y-1 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                        <Icon name={c.icon} size={20} className="text-white" />
                      </div>
                      {done && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 text-emerald-300 bg-emerald-400/15">
                          <Icon name="Check" size={11} />
                          Начато
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base mb-1.5 leading-snug">{c.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Icon name="Wrench" size={11} />
                        {constructorLabel[c.lessons[0].taskType]}
                      </span>
                      <Icon name="ArrowRight" size={13} className="text-primary shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
          <Icon name="FolderKanban" size={20} className="text-primary" />
          {isTeacher ? 'Все сданные работы' : 'Мои работы'}
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.key ? 'bg-gradient-brand text-white glow' : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" size={28} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Icon name="FolderOpen" size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isTeacher ? 'Пока никто не сдал работы' : 'Вы ещё не начали ни одного задания'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => {
              const meta = statusMeta[s.status];
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="text-left glass rounded-2xl p-5 hover:border-primary/40 hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                      <Icon name="FileText" size={20} className="text-white" />
                    </div>
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${meta.color}`}>
                      <Icon name={meta.icon} size={11} />
                      {meta.label}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base mb-1.5 leading-snug">{s.task_title}</h3>
                  {isTeacher && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {s.student_full_name || s.student_name}
                      {s.student_group && ` · гр. ${s.student_group}`}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                    <span>{new Date(s.updated_at).toLocaleDateString('ru-RU')}</span>
                    {s.grade !== null && s.grade !== undefined && (
                      <span className="font-display font-bold text-gradient">{s.grade}/100</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <SubmissionViewer
        submission={selected}
        onOpenChange={(v) => !v && setSelected(null)}
        isTeacher={isTeacher}
        onReviewed={load}
      />

      <TaskConstructorModal
        course={openCourse}
        onOpenChange={(v) => !v && setOpenCourse(null)}
        onSubmitted={load}
      />
    </div>
  );
};

export default Projects;