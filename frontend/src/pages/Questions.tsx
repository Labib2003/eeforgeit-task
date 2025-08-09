import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { QuestionDialogForm } from "@/components/custom/QuestionModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { EVALUATION_LEVELS, EVALUATION_STEPS } from "@/constants";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationModal";

interface Question {
  id: string;
  question: string;
  imageUrl: string;
  step: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

type Meta = {
  total: number;
  page?: number;
  limit?: number;
};

const DEFAULT_LIMIT = 10;

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);

  // NEW: filters
  const [selectedStep, setSelectedStep] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const fetchQuestions = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/questions", {
        params: {
          page,
          // only include when selected
          step:
            selectedStep.length && selectedStep !== "all"
              ? selectedStep
              : undefined,
          level:
            selectedLevel.length && selectedLevel !== "all"
              ? selectedLevel
              : undefined,
        },
      });

      const data = res?.data?.data?.data as Question[] | undefined;
      const meta = res?.data?.data?.meta as Meta | undefined;

      setQuestions(data ?? []);
      setTotalResults(meta?.total ?? 0);

      if (meta?.page && meta.page !== currentPage) setCurrentPage(meta.page);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ?? "Failed to fetch questions",
        );
      } else {
        toast.error("An error occurred while fetching questions");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, refetch, selectedStep, selectedLevel]);

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

  const clearFilters = () => {
    setSelectedStep("");
    setSelectedLevel("");
    setCurrentPage(1);
  };

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-2xl">Questions</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Step filter */}
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
                {/* Optional 'All' item by setting empty string */}
                <SelectItem value="all">All Steps</SelectItem>
                {EVALUATION_STEPS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level filter */}
            <Select
              value={selectedLevel}
              onValueChange={(v) => {
                setSelectedLevel(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter: Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {EVALUATION_LEVELS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <QuestionDialogForm mode="create" setRefetch={setRefetch} />
        </div>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Question</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Step</TableHead>
            <TableHead className="text-right">Level</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-medium">{q.question}</TableCell>
              <TableCell className="truncate max-w-[240px]">
                {q.imageUrl || "N/A"}
              </TableCell>
              <TableCell>{q.step}</TableCell>
              <TableCell className="text-right">{q.level}</TableCell>
              <TableCell className="text-right space-x-2">
                <QuestionDialogForm
                  key={q.id}
                  mode="update"
                  defaultValues={q}
                  id={q.id}
                  setRefetch={setRefetch}
                />
                <DeleteConfirmDialog
                  message="Are you sure you want to delete this question?"
                  onConfirm={async () => {
                    try {
                      await axiosInstance.delete(`/questions/${q.id}`);
                      setRefetch((prev) => !prev);
                    } catch (error) {
                      if (error instanceof AxiosError) {
                        toast.error(
                          error.response?.data?.message ??
                            "Failed to delete question",
                        );
                      } else {
                        toast.error(
                          "An error occurred while deleting the question",
                        );
                      }
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}

          {!isLoading && questions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground"
              >
                No questions found.
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
};

export default Questions;
