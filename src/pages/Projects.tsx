import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { submissionsApi, Submission } from '@/lib/api';
import SubmissionViewer from '@/components/tasks/SubmissionViewer';
import TaskConstructorModal from '@/components/tasks/TaskConstructorModal';
import { courses, Course } from '@/data/course';

const statusMeta: Record<string, { label: string; color: string; icon: string }> = {
  in_progress: { label: 'В процессе', color: 'text-amber-300 bg-amber-400/15', icon: 'Pencil' },
  submitted: { label: 'На проверке', color: 'text-cyan-300 bg-cyan-400/15', icon: 'Send' },
  reviewed: { label: 'Проверено', color: 'text-emerald-300 bg-emerald-400/15', icon: 'CheckCheck' },
};

const filters = [
  { key: 'all', label: 'Все' },
  { key: 'submitted', label: 'На проверке' },
  { key: 'reviewed', label: 'Проверено' },
  { key: 'in_progress', label: 'В процессе' },
];

const constructorLabel: Record<string, string> = {
  mindmap: 'Конструктор: интеллект-карта',
  baccm: 'Конструктор: форма BACCM',
  stakeholders: 'Конструктор: матрица стейкхолдеров',
  smart: 'Конструктор: SMART-цели',
  persona: 'Конструктор: карточки персон',
};

const Projects = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [openCourse, setOpenCourse] = useState<Course | null>(null);

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

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);
  const isTeacher = user?.role === 'teacher';

  const submittedTaskKeys = new Set(submissions.map((s) => s.task_key));

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center glow">
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-xl">
              Pro<span className="text-gradient">Level</span>
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground">
              <Icon name="ArrowLeft" size={16} className="mr-1.5" /> На главную
            </Button>
          </Link>
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
                    <p className="text-xs text-muted-foreground mb-2">{s.student_name}</p>
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