import { Link } from 'react-router-dom';
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
import { DesignDocument } from '@/lib/api';
import { designDocStatusMeta } from '@/data/designDocSections';

type SaveStatus = 'idle' | 'saving' | 'saved';

interface DesignDocEditorHeaderProps {
  doc: DesignDocument;
  isTeacher: boolean;
  readOnly: boolean;
  saveStatus: SaveStatus;
  exporting: boolean;
  submitting: boolean;
  clearing: boolean;
  restarting: boolean;
  reviewing: boolean;
  userFullName?: string | null;
  userGroupName?: string | null;
  onExport: () => void;
  onClear: () => void;
  onRestart: () => void;
  onSubmit: () => void;
  onAccept: () => void;
  onOpenReview: () => void;
}

const DesignDocEditorHeader = ({
  doc,
  isTeacher,
  readOnly,
  saveStatus,
  exporting,
  submitting,
  clearing,
  restarting,
  reviewing,
  userFullName,
  userGroupName,
  onExport,
  onClear,
  onRestart,
  onSubmit,
  onAccept,
  onOpenReview,
}: DesignDocEditorHeaderProps) => {
  const meta = designDocStatusMeta[doc.status];

  return (
    <>
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
            <Button variant="outline" size="sm" disabled={exporting} onClick={onExport} className="h-9 text-xs rounded-lg">
              {exporting ? <Icon name="Loader2" size={13} className="mr-1.5 animate-spin" /> : <Icon name="Download" size={13} className="mr-1.5" />}
              Экспорт в .docx
            </Button>
            {!isTeacher && !readOnly && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={clearing} className="h-9 text-xs text-muted-foreground hover:text-destructive rounded-lg">
                    {clearing ? <Icon name="Loader2" size={13} className="mr-1.5 animate-spin" /> : <Icon name="Eraser" size={13} className="mr-1.5" />}
                    Очистить документ
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Стереть все данные документа?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Содержимое всех 13 разделов будет удалено без возможности восстановления. Название и тип проекта сохранятся — вы сможете заполнить разделы заново.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={onClear} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                      {clearing ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Стереть и начать заново'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {!isTeacher && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={restarting} className="h-9 text-xs text-muted-foreground hover:text-destructive rounded-lg">
                    {restarting ? <Icon name="Loader2" size={13} className="mr-1.5 animate-spin" /> : <Icon name="RotateCcw" size={13} className="mr-1.5" />}
                    Начать заново
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Начать зачётное задание заново?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Этот документ будет полностью удалён без возможности восстановления. Вы сможете создать новый дизайн-документ с чистого листа.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={onRestart} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                      {restarting ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Удалить и начать заново'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                      {(!userFullName || !userGroupName)
                        ? 'Перед отправкой укажите ФИО и номер группы в личном кабинете — преподаватель должен видеть, кто автор работы.'
                        : 'После отправки редактирование будет недоступно до момента, пока преподаватель не вернёт документ на доработку.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit} className="bg-gradient-brand border-0 rounded-xl">
                      {submitting ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Отправить'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isTeacher && doc.status === 'submitted' && (
              <>
                <Button size="sm" disabled={reviewing} onClick={onAccept} className="h-9 text-xs bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-lg">
                  <Icon name="CheckCheck" size={13} className="mr-1.5" />
                  Принять работу
                </Button>
                <Button size="sm" variant="outline" disabled={reviewing} onClick={onOpenReview} className="h-9 text-xs border-orange-500/40 text-orange-300 hover:bg-orange-500/10 rounded-lg">
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
    </>
  );
};

export default DesignDocEditorHeader;
