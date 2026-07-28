import Icon from '@/components/ui/icon';
import { DesignDocument } from '@/lib/api';
import { designDocSections, projectTypeLabels } from '@/data/designDocSections';

interface DesignDocSidebarProps {
  doc: DesignDocument;
  isTeacher: boolean;
  activeSection: string;
  onSelectSection: (key: string) => void;
}

const DesignDocSidebar = ({ doc, isTeacher, activeSection, onSelectSection }: DesignDocSidebarProps) => {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="glass rounded-2xl p-3 space-y-1 mb-4">
        {designDocSections.map((s) => (
          <button
            key={s.key}
            onClick={() => onSelectSection(s.key)}
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
  );
};

export default DesignDocSidebar;
