import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { designDocumentsApi, DesignDocument } from '@/lib/api';
import { designDocStatusMeta, projectTypeOptions, projectTypeLabels, ProjectType } from '@/data/designDocSections';
import RequirementsDialog from '@/components/design-doc/RequirementsDialog';
import { toast } from 'sonner';

const filters = [
  { key: 'all', label: 'Все' },
  { key: 'submitted', label: 'На проверке' },
  { key: 'accepted', label: 'Принят' },
  { key: 'needs_revision', label: 'На доработке' },
  { key: 'in_progress', label: 'Черновик' },
];

const DesignDocs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'teacher';

  const [documents, setDocuments] = useState<DesignDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ProjectType>('other');
  const [requirementsOpen, setRequirementsOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    designDocumentsApi
      .list()
      .then((data) => setDocuments(data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === 'all' ? documents : documents.filter((d) => d.status === filter);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error('Введите название проекта');
      return;
    }
    setCreating(true);
    try {
      const { document } = await designDocumentsApi.create(newTitle.trim(), newType);
      toast.success('Документ создан');
      setCreateOpen(false);
      setNewTitle('');
      setNewType('other');
      navigate(`/design-docs/${document.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось создать документ');
    } finally {
      setCreating(false);
    }
  };

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
            <Link to="/projects">
              <Button variant="ghost" className="text-muted-foreground">
                <Icon name="FolderKanban" size={16} className="mr-1.5" /> Проекты
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
        <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-sm font-semibold text-gradient uppercase tracking-widest">Зачётное задание</span>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-2">
              {isTeacher ? 'Дизайн-документы студентов' : 'Мои дизайн-документы'}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {isTeacher
                ? 'Проверяйте дизайн-документы проектов, принимайте их или возвращайте на доработку'
                : 'Создайте дизайн-документ проекта по универсальной структуре из 13 разделов'}
            </p>
            {!isTeacher && (
              <button
                onClick={() => setRequirementsOpen(true)}
                className="text-primary text-sm font-medium mt-2 flex items-center gap-1.5 hover:underline"
              >
                <Icon name="BookOpenCheck" size={15} />
                Ознакомиться с требованиями к оформлению дизайн-документа
              </button>
            )}
          </div>
          {!isTeacher && (
            <Button onClick={() => setCreateOpen(true)} className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl shrink-0">
              <Icon name="Plus" size={16} className="mr-1.5" /> Создать новый документ
            </Button>
          )}
        </div>

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
            <Icon name="FileText" size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isTeacher ? 'Пока нет документов на проверке' : 'Вы ещё не создали ни одного документа'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => {
              const meta = designDocStatusMeta[d.status];
              return (
                <button
                  key={d.id}
                  onClick={() => navigate(`/design-docs/${d.id}`)}
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
                  <h3 className="font-display font-bold text-base mb-1.5 leading-snug line-clamp-2">{d.title}</h3>
                  {isTeacher && (
                    <p className="text-xs text-muted-foreground mb-1.5">{d.student_name}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-3">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Icon name="Tag" size={11} />
                      {projectTypeLabels[d.project_type]}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(d.updated_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-3xl">
          <DialogHeader>
            <DialogTitle>Создать дизайн-документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Название проекта</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Например: Реконструкция городского парка"
                className="h-10 bg-secondary/40 border-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Автор</label>
              <Input value={user?.name || ''} readOnly className="h-10 bg-secondary/20 border-border text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Тип проекта</label>
              <Select value={newType} onValueChange={(v: ProjectType) => setNewType(v)}>
                <SelectTrigger className="h-10 bg-secondary/40 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {projectTypeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="w-full bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl mt-2"
            >
              {creating ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Создать и перейти к редактированию'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RequirementsDialog open={requirementsOpen} onOpenChange={setRequirementsOpen} />
    </div>
  );
};

export default DesignDocs;