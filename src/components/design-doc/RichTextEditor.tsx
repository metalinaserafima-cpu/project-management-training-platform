import { useRef, useEffect, useCallback, useState } from 'react';
import Icon from '@/components/ui/icon';
import { uploadImageApi } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  value: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const toolButtons: { icon: string; cmd: string; title: string; arg?: string }[] = [
  { icon: 'Bold', cmd: 'bold', title: 'Жирный' },
  { icon: 'Italic', cmd: 'italic', title: 'Курсив' },
  { icon: 'Underline', cmd: 'underline', title: 'Подчёркнутый' },
  { icon: 'List', cmd: 'insertUnorderedList', title: 'Маркированный список' },
  { icon: 'ListOrdered', cmd: 'insertOrderedList', title: 'Нумерованный список' },
];

const RichTextEditor = ({ value, onChange, readOnly, placeholder }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (!ref.current) return;
    isInternalUpdate.current = true;
    onChange(ref.current.innerHTML);
  }, [onChange]);

  const exec = (cmd: string, arg?: string) => {
    if (readOnly) return;
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emitChange();
  };

  const insertTable = () => {
    if (readOnly) return;
    const rows = 3;
    const cols = 3;
    let html = '<table style="width:100%;border-collapse:collapse;margin:8px 0"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #94a3b8;padding:6px 8px;min-width:60px">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    ref.current?.focus();
    document.execCommand('insertHTML', false, html);
    emitChange();
  };

  const handleImagePick = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (максимум 5 МБ)');
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { url } = await uploadImageApi.upload(base64, file.type);
      ref.current?.focus();
      document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0" /><p><br></p>`);
      emitChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось загрузить изображение');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-secondary/20 overflow-hidden">
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap bg-card/40">
          {toolButtons.map((b) => (
            <button
              key={b.cmd}
              type="button"
              title={b.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(b.cmd, b.arg)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Icon name={b.icon} size={15} />
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            title="Вставить таблицу"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertTable}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Icon name="Table" size={15} />
          </button>
          <button
            type="button"
            title="Вставить изображение"
            disabled={uploading}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleImagePick}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Icon name={uploading ? 'Loader2' : 'Image'} size={15} className={uploading ? 'animate-spin' : ''} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
        </div>
      )}
      <div
        ref={ref}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className={`prose-editor min-h-[160px] max-h-[480px] overflow-y-auto p-4 text-sm leading-relaxed outline-none ${readOnly ? '' : 'cursor-text'}`}
      />
    </div>
  );
};

export default RichTextEditor;
