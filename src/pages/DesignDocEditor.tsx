import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { designDocumentsApi, DesignDocument } from '@/lib/api';
import { designDocSections, designDocStatusMeta, projectTypeLabels } from '@/data/designDocSections';
import RichTextEditor from '@/components/design-doc/RichTextEditor';
import { exportDesignDocToDocx } from '@/lib/exportDesignDoc';
import { toast } from 'sonner';

type SaveStatus = 'idle' | 'saving' | 'saved';

const DesignDocEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'teacher';

  const [doc, setDoc] = useState<DesignDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(designDocSections[0].key);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [exporting, setExporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [reviewComment, setReviewComment] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionsRef = useRef<Record<string, string>>({});

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    designDocumentsApi
      .get(Number(id))
      .then((data) => {
        setDoc(data.document);
        sectionsRef.current = data.document.sections || {};
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Не удалось загрузить документ'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const readOnly = isTeacher || doc?.status === 'submitted' || doc?.status === 'accepted';

  const persistSections = useCallback(() => {
    if (!doc || isTeacher) return;
    setSaveStatus('saving');
    designDocumentsApi
      .save(doc.id, sectionsRef.current)
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('idle'));
  }, [doc, isTeacher]);

  const handleSectionChange = (key: string, html: string) => {
    sectionsRef.current = { ...sectionsRef.current, [key]: html };
    setDoc((prev) => (prev ? { ...prev, sections: sectionsRef.current } : prev));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(persistSections, 1200);
  };

  const handleSubmit = async () => {
    if (!doc) return;
    setSubmitting(true);
    try {
      const { document } = await designDocumentsApi.submit(doc.id, sectionsRef.current);
      setDoc(document);
      toast.success('Документ отправлен на проверку преподавателю');
      navigate('/design-docs');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось отправить документ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!doc) return;
    setExporting(true);
    try {
      await exportDesignDocToDocx({
        title: doc.title,
        project_type: doc.project_type,
        student_name: doc.student_name || user?.name,
        sections: doc.sections || {},
      });
      toast.success('Файл Word сохранён');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось экспортировать документ');
    } finally {
      setExporting(false);
    }
  };

  const handleAccept = async () => {
    if (!doc) return;
    setReviewing(true);
    try {
      const { document } = await designDocumentsApi.accept(doc.id);
      setDoc(document);
      toast.success('Работа принята');
      navigate('/design-docs');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось принять работу');
    } finally {
      setReviewing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!doc) return;
    setReviewing(true);
    try {
      const { document } = await designDocumentsApi.requestRevision(doc.id, reviewComment.trim());
      setDoc(document);
      toast.success('Документ возвращён студенту на доработку');
      setReviewOpen(false);
      navigate('/design-docs');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось вернуть документ на доработку');
    } finally {
      setReviewing(false);
    }
  };

  const toggleCollapsed = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Icon name="FileX" size={32} className="text-muted-foreground" />
        <p className="text-muted-foreground">Документ не найден</p>
        <Link to="/design-docs">
          <Button variant="outline" className="rounded-xl">Назад к списку</Button>
        </Link>
      </div>
    );
  }

  const meta = designDocStatusMeta[doc.status];

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/design-docs" className="shrink-0">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Icon name="ArrowLeft" size={18} />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base leading-snug truncate max-w-[280px] md:max-w-md">{doc.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${meta.color}`}>
                  <Icon name={meta.icon} size={10} />
                  {meta.label}
                </span>
                {!isTeacher && saveStatus === 'saving' && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Icon name="Loader2" size={10} className="animate-spin" /> Сохранение...</span>
                )}
                {!isTeacher && saveStatus === 'saved' && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1"><Icon name="Check" size={10} /> Сохранено</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" disabled={exporting} onClick={handleExport} className="h-9 text-xs rounded-lg">
              {exporting ? <Icon name="Loader2" size={13} className="mr-1.5 animate-spin" /> : <Icon name="Download" size={13} className="mr-1.5" />}
              Экспорт в .docx
            </Button>
            {!isTeacher && !readOnly && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" disabled={submitting} className="h-9 text-xs bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-lg">
                    <Icon name="Send" size={13} className="mr-1.5" />
                    Отправить на проверку
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Отправить документ на проверку?</AlertDialogTitle>
                    <AlertDialogDescription>
                      После отправки редактирование будет недоступно до момента, пока преподаватель не вернёт документ на доработку.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit} className="bg-gradient-brand border-0 rounded-xl">
                      {submitting ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Отправить'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isTeacher && doc.status === 'submitted' && (
              <>
                <Button size="sm" disabled={reviewing} onClick={handleAccept} className="h-9 text-xs bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-lg">
                  <Icon name="CheckCheck" size={13} className="mr-1.5" />
                  Принять работу
                </Button>
                <Button size="sm" variant="outline" disabled={reviewing} onClick={() => setReviewOpen(true)} className="h-9 text-xs border-orange-500/40 text-orange-300 hover:bg-orange-500/10 rounded-lg">
                  <Icon name="RotateCcw" size={13} className="mr-1.5" />
                  Вернуть на доработку
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {doc.status === 'needs_revision' && doc.teacher_comment && !isTeacher && (
        <div className="container pt-6">
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4">
            <div className="font-display font-semibold text-sm mb-1.5 flex items-center gap-2 text-orange-300">
              <Icon name="RotateCcw" size={16} />
              Преподаватель вернул документ на доработку
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{doc.teacher_comment}</p>
          </div>
        </div>
      )}

      <main className="container py-8 grid lg:grid-cols-[280px_1fr] gap-6 items-start">
        <aside className="lg:sticky lg:top-24">
          <div className="glass rounded-2xl p-3 space-y-1 mb-4">
            {designDocSections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-sm transition-colors ${
                  activeSection === s.key ? 'bg-gradient-brand text-white' : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${activeSection === s.key ? 'bg-white/20' : 'bg-secondary'}`}>
                  {s.number}
                </span>
                <Icon name={s.icon} size={14} className="shrink-0" />
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>

          <div className="glass rounded-2xl p-4 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-1.5"><Icon name="Tag" size={12} /> {projectTypeLabels[doc.project_type]}</div>
            {isTeacher && doc.student_name && <div className="flex items-center gap-1.5"><Icon name="User" size={12} /> {doc.student_name}</div>}
            <div className="flex items-center gap-1.5"><Icon name="Clock" size={12} /> Обновлено {new Date(doc.updated_at).toLocaleString('ru-RU')}</div>
          </div>
        </aside>

        <div>
          {isTeacher ? (
            <div className="space-y-3">
              {designDocSections.map((s) => {
                const isCollapsed = !collapsedSections.has(s.key);
                const html = doc.sections[s.key] || '';
                return (
                  <div key={s.key} className="glass rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleCollapsed(s.key)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="font-display font-semibold text-sm flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[11px] font-bold">{s.number}</span>
                        <Icon name={s.icon} size={15} />
                        {s.title}
                      </span>
                      <Icon name={isCollapsed ? 'ChevronDown' : 'ChevronUp'} size={16} className="text-muted-foreground" />
                    </button>
                    {!isCollapsed && (
                      <div className="px-4 pb-4">
                        {html.trim() ? (
                          <div className="prose-editor text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Не заполнено</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {designDocSections.map((s) => (
                <div key={s.key} className={activeSection === s.key ? 'block' : 'hidden'}>
                  <div className="mb-4">
                    <h2 className="font-display font-bold text-xl flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gradient-brand text-white flex items-center justify-center text-xs font-bold">{s.number}</span>
                      {s.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1.5">{s.hint}</p>
                  </div>

                  {s.key === 'title_page' ? (
                    <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Название проекта</label>
                        <Input
                          value={doc.title}
                          readOnly={readOnly}
                          onChange={(e) => setDoc((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                          onBlur={() => doc.title.trim() && !isTeacher && designDocumentsApi.save(doc.id, sectionsRef.current, doc.title.trim()).catch(() => {})}
                          className="h-10 bg-card/60 border-border"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Автор</label>
                        <Input value={doc.student_name || user?.name || ''} readOnly className="h-10 bg-card/40 border-border text-muted-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Тип проекта</label>
                        <Input value={projectTypeLabels[doc.project_type]} readOnly className="h-10 bg-card/40 border-border text-muted-foreground" />
                      </div>
                    </div>
                  ) : s.key === 'toc' ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-secondary/10">
                      <Icon name="ListTree" size={28} className="mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Оглавление формируется автоматически при экспорте документа в Word — на основе заголовков разделов
                      </p>
                    </div>
                  ) : (
                    <RichTextEditor
                      value={doc.sections[s.key] || ''}
                      onChange={(html) => handleSectionChange(s.key, html)}
                      readOnly={readOnly}
                      placeholder={`Заполните раздел «${s.title}»...`}
                    />
                  )}

                </div>
              ))}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  disabled={designDocSections.findIndex((s) => s.key === activeSection) === 0}
                  onClick={() => {
                    const idx = designDocSections.findIndex((s) => s.key === activeSection);
                    if (idx > 0) setActiveSection(designDocSections[idx - 1].key);
                  }}
                  className="rounded-xl"
                >
                  <Icon name="ChevronLeft" size={15} className="mr-1.5" /> Назад
                </Button>
                <Button
                  variant="outline"
                  disabled={designDocSections.findIndex((s) => s.key === activeSection) === designDocSections.length - 1}
                  onClick={() => {
                    const idx = designDocSections.findIndex((s) => s.key === activeSection);
                    if (idx < designDocSections.length - 1) setActiveSection(designDocSections[idx + 1].key);
                  }}
                  className="rounded-xl"
                >
                  Далее <Icon name="ChevronRight" size={15} className="ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-3xl">
          <DialogHeader>
            <DialogTitle>Вернуть на доработку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Опишите, что нужно доработать студенту..."
              className="min-h-[120px] bg-secondary/40 border-border resize-none"
            />
            <Button
              onClick={handleRequestRevision}
              disabled={reviewing || !reviewComment.trim()}
              className="w-full bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl"
            >
              {reviewing ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Отправить студенту'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignDocEditor;