import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationModal";
import { EVALUATION_STEPS } from "@/constants";
import { SubmissionEvaluateModal } from "@/components/custom/SubmissionEvaluaitonModal";

type Submission = {
  id: string;
  submittedById: string;
  submittedBy: Record<string, string>;
  examinedById?: string;
  examinedBy?: Record<string, string>;
  step: string;
  level?: string;
  questionsAndAnswers: {
    question: string;
    imageUrl?: string;
    answer: string;
    correct?: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
};

type Meta = {
  total: number;
  page?: number;
  limit?: number;
};

const DEFAULT_LIMIT = 10;

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [refetch, setRefetch] = useState<boolean>(false);

  // Filters
  const [selectedStep, setSelectedStep] = useState<string>("all");

  const fetchUsers = async (page = 1) => {
    try {
      const res = await axiosInstance.get("/submissions", {
        params: {
          page,
          step: selectedStep !== "all" ? selectedStep : undefined,
        },
      });

      const data = res?.data?.data?.data as Submission[] | undefined;
      const meta = res?.data?.data?.meta as Meta | undefined;

      setSubmissions(data ?? []);
      setTotalResults(meta?.total ?? 0);
      if (meta?.page && meta.page !== currentPage) setCurrentPage(meta.page);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ?? "Failed to fetch submissions",
        );
      } else {
        toast.error("An error occurred while fetching submissions");
      }
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, refetch, selectedStep]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalResults / DEFAULT_LIMIT)),
    [totalResults],
  );

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const add = (p: number) => pages.push(p);
    const addEllipsis = () => {
      if (pages[pages.length - 1] !== "ellipsis") pages.push("ellipsis");
    };
    const window = 1;
    const start = Math.max(2, currentPage - window);
    const end = Math.min(totalPages - 1, currentPage + window);

    add(1);
    if (start > 2) addEllipsis();
    for (let p = start; p <= end; p++) add(p);
    if (end < totalPages - 1) addEllipsis();
    if (totalPages > 1) add(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-2xl">Submissions</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Role filter */}
            <Select
              value={selectedStep}
              onValueChange={(v) => {
                setSelectedStep(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter: Step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Steps</SelectItem>
                {EVALUATION_STEPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Step</TableHead>
            <TableHead className="text-right">Level</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {submissions.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">
                {s.submittedBy?.name || "—"}
              </TableCell>
              <TableCell className="truncate max-w-[260px]">
                {s.submittedBy?.email}
              </TableCell>
              <TableCell>{s.step}</TableCell>
              <TableCell className="text-right">
                {s?.level || "Pending"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <SubmissionEvaluateModal
                  submissionId={s.id}
                  questionsAndAnswers={s.questionsAndAnswers}
                  onUpdated={() => setRefetch((s) => !s)}
                />
                <DeleteConfirmDialog
                  message="Are you sure you want to delete this user?"
                  onConfirm={async () => {
                    try {
                      await axiosInstance.delete(`/submissions/${s.id}`);
                      setRefetch((prev) => !prev);
                    } catch (error) {
                      if (error instanceof AxiosError) {
                        toast.error(
                          error.response?.data?.message ??
                            "Failed to delete submission",
                        );
                      } else {
                        toast.error(
                          "An error occurred while deleting the submission",
                        );
                      }
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}

          {submissions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground"
              >
                No submissions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (canPrev) setCurrentPage((p) => p - 1);
                }}
                aria-disabled={!canPrev}
                className={!canPrev ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {pageNumbers.map((p, idx) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      if (p !== currentPage) setCurrentPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (canNext) setCurrentPage((p) => p + 1);
                }}
                aria-disabled={!canNext}
                className={!canNext ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
