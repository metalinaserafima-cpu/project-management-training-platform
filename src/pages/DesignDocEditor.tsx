import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { designDocumentsApi, DesignDocument } from '@/lib/api';
import { designDocSections } from '@/data/designDocSections';
import { exportDesignDocToDocx } from '@/lib/exportDesignDoc';
import DesignDocEditorHeader from '@/components/design-doc/DesignDocEditorHeader';
import DesignDocSidebar from '@/components/design-doc/DesignDocSidebar';
import DesignDocContent from '@/components/design-doc/DesignDocContent';
import DesignDocReviewDialog from '@/components/design-doc/DesignDocReviewDialog';
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
  const [clearing, setClearing] = useState(false);
  const [restarting, setRestarting] = useState(false);
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
    if (!user?.full_name || !user?.group_name) {
      toast.error('Укажите ФИО и номер группы в личном кабинете перед отправкой документа');
      navigate('/projects');
      return;
    }
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

  const handleClear = async () => {
    if (!doc) return;
    setClearing(true);
    try {
      const emptySections: Record<string, string> = {};
      const { document } = await designDocumentsApi.save(doc.id, emptySections);
      sectionsRef.current = emptySections;
      setDoc(document);
      setActiveSection(designDocSections[0].key);
      toast.success('Все данные документа очищены, можно заполнить заново');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось очистить документ');
    } finally {
      setClearing(false);
    }
  };

  const handleRestart = async () => {
    if (!doc) return;
    setRestarting(true);
    try {
      await designDocumentsApi.remove(doc.id);
      toast.success('Документ удалён, можно начать зачётное задание заново');
      navigate('/design-docs');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить документ');
    } finally {
      setRestarting(false);
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

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <DesignDocEditorHeader
        doc={doc}
        isTeacher={isTeacher}
        readOnly={readOnly}
        saveStatus={saveStatus}
        exporting={exporting}
        submitting={submitting}
        clearing={clearing}
        restarting={restarting}
        reviewing={reviewing}
        userFullName={user?.full_name}
        userGroupName={user?.group_name}
        onExport={handleExport}
        onClear={handleClear}
        onRestart={handleRestart}
        onSubmit={handleSubmit}
        onAccept={handleAccept}
        onOpenReview={() => setReviewOpen(true)}
      />

      <main className="container py-8 grid lg:grid-cols-[280px_1fr] gap-6 items-start">
        <DesignDocSidebar
          doc={doc}
          isTeacher={isTeacher}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <div>
          <DesignDocContent
            doc={doc}
            isTeacher={isTeacher}
            readOnly={readOnly}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            collapsedSections={collapsedSections}
            toggleCollapsed={toggleCollapsed}
            onTitleChange={(title) => setDoc((prev) => (prev ? { ...prev, title } : prev))}
            onTitleBlur={() => doc.title.trim() && !isTeacher && designDocumentsApi.save(doc.id, sectionsRef.current, doc.title.trim()).catch(() => {})}
            onSectionChange={handleSectionChange}
          />
        </div>
      </main>

      <DesignDocReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        reviewing={reviewing}
        onRequestRevision={handleRequestRevision}
      />
    </div>
  );
};

export default DesignDocEditor;
