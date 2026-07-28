import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DesignDocReviewDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reviewComment: string;
  setReviewComment: (v: string) => void;
  reviewing: boolean;
  onRequestRevision: () => void;
}

const DesignDocReviewDialog = ({
  open,
  onOpenChange,
  reviewComment,
  setReviewComment,
  reviewing,
  onRequestRevision,
}: DesignDocReviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={onRequestRevision}
            disabled={reviewing || !reviewComment.trim()}
            className="w-full bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl"
          >
            {reviewing ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Отправить студенту'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignDocReviewDialog;
