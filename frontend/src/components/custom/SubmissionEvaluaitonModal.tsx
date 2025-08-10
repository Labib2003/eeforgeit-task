import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type QAItem = {
  question: string;
  imageUrl?: string;
  answer: string;
  correct?: boolean;
};

interface SubmissionEvaluateModalProps {
  submissionId: string;
  questionsAndAnswers: QAItem[];
  trigger?: React.ReactNode;
  onUpdated?: () => void; // refetch callback after save
}

export function SubmissionEvaluateModal({
  submissionId,
  questionsAndAnswers,
  trigger,
  onUpdated,
}: SubmissionEvaluateModalProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [list, setList] = useState<QAItem[]>([]);

  useEffect(() => {
    if (open) {
      // take a local editable copy
      setList(questionsAndAnswers.map((x) => ({ ...x })));
      setIndex(0);
    }
  }, [open, questionsAndAnswers]);

  const total = list.length;
  const current = useMemo(() => list[index], [list, index]);

  const mark = (value: "unmarked" | "true" | "false") => {
    const next = [...list];
    if (value === "unmarked") delete next[index].correct;
    else next[index].correct = value === "true";
    setList(next);
  };

  const handleSaveAll = async () => {
    try {
      await axiosInstance.patch(`/submissions/${submissionId}`, {
        questionsAndAnswers: list,
      });
      toast.success("Saved evaluation");
      setOpen(false);
      onUpdated?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save evaluation");
    }
  };

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="secondary">
            Evaluate
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            Evaluate Submission • {index + 1} / {total}
          </DialogTitle>
        </DialogHeader>

        {current ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Question</div>
              <p className="text-base font-medium leading-relaxed">
                {current.question}
              </p>
              {current.imageUrl && (
                <div className="rounded border p-2">
                  <a
                    href={current.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline"
                  >
                    View attached image
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Student Answer
              </div>
              <div className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
                {current.answer || <span className="opacity-60">—</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Mark:</div>
              <Select
                value={
                  current.correct === undefined
                    ? "unmarked"
                    : current.correct
                      ? "true"
                      : "false"
                }
                onValueChange={mark}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select mark" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unmarked">Unmarked</SelectItem>
                  <SelectItem value="true">Correct</SelectItem>
                  <SelectItem value="false">Incorrect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Submission ID: {submissionId.slice(0, 8)}…
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={index === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={index >= total - 1}
                >
                  Next
                </Button>
                <Button size="sm" onClick={handleSaveAll}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No items.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
