import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskType } from '@/data/course';
import { exportTask } from '@/lib/exportTask';
import { toast } from 'sonner';

interface Props {
  taskType: TaskType;
  taskTitle: string;
  content: Record<string, unknown> | null;
  variant?: 'ghost' | 'outline';
}

const ExportButton = ({ taskType, taskTitle, content, variant = 'outline' }: Props) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'docx' | 'xlsx') => {
    if (!content) {
      toast.error('Сначала заполните задание');
      return;
    }
    setExporting(true);
    try {
      await exportTask(taskType, taskTitle, content, format);
      toast.success(format === 'docx' ? 'Файл Word сохранён' : 'Файл Excel сохранён');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось экспортировать файл');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" disabled={exporting} className="h-8 text-xs rounded-lg">
          {exporting ? <Icon name="Loader2" size={13} className="mr-1.5 animate-spin" /> : <Icon name="Download" size={13} className="mr-1.5" />}
          Экспорт
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={() => handleExport('docx')} className="text-sm cursor-pointer">
          <Icon name="FileText" size={14} className="mr-2 text-blue-400" />
          Скачать в Word (.docx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')} className="text-sm cursor-pointer">
          <Icon name="Sheet" size={14} className="mr-2 text-emerald-400" />
          Скачать в Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
