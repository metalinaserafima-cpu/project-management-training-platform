import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { DesignDocument } from '@/lib/api';
import { designDocSections, projectTypeLabels } from '@/data/designDocSections';
import RichTextEditor from '@/components/design-doc/RichTextEditor';

interface DesignDocContentProps {
  doc: DesignDocument;
  isTeacher: boolean;
  readOnly: boolean;
  activeSection: string;
  setActiveSection: (key: string) => void;
  collapsedSections: Set<string>;
  toggleCollapsed: (key: string) => void;
  onTitleChange: (title: string) => void;
  onTitleBlur: () => void;
  onSectionChange: (key: string, html: string) => void;
}

const DesignDocContent = ({
  doc,
  isTeacher,
  readOnly,
  activeSection,
  setActiveSection,
  collapsedSections,
  toggleCollapsed,
  onTitleChange,
  onTitleBlur,
  onSectionChange,
}: DesignDocContentProps) => {
  const { user } = useAuth();

  if (isTeacher) {
    return (
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
    );
  }

  return (
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
                  onChange={(e) => onTitleChange(e.target.value)}
                  onBlur={onTitleBlur}
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
              onChange={(html) => onSectionChange(s.key, html)}
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
  );
};

export default DesignDocContent;
