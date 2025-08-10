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

import { UserDialogForm } from "@/components/custom/UserModal";
import { DeleteConfirmDialog } from "@/components/custom/DeleteConfirmationModal";
import { ROLE_OPTIONS } from "@/constants";

type User = {
  id: string;
  name?: string;
  email: string;
  role: string;
  active?: boolean;
  createdAt: string;
};

type Meta = {
  total: number;
  page?: number;
  limit?: number;
};

const DEFAULT_LIMIT = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [refetch, setRefetch] = useState<boolean>(false);

  // Filters
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const fetchUsers = async (page = 1) => {
    try {
      const res = await axiosInstance.get("/users", {
        params: {
          page,
          role: selectedRole !== "all" ? selectedRole : undefined,
        },
      });

      const data = res?.data?.data?.data as User[] | undefined;
      const meta = res?.data?.data?.meta as Meta | undefined;

      setUsers(data ?? []);
      setTotalResults(meta?.total ?? 0);
      if (meta?.page && meta.page !== currentPage) setCurrentPage(meta.page);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to fetch users");
      } else {
        toast.error("An error occurred while fetching users");
      }
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, refetch, selectedRole]);

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
          <h1 className="font-bold text-2xl">Users</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Role filter */}
            <Select
              value={selectedRole}
              onValueChange={(v) => {
                setSelectedRole(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter: Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <UserDialogForm mode="create" setRefetch={setRefetch} />
        </div>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Active</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name || "—"}</TableCell>
              <TableCell className="truncate max-w-[260px]">
                {u.email}
              </TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell className="text-right">
                {u.active ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <UserDialogForm
                  key={u.id}
                  mode="update"
                  id={u.id}
                  defaultValues={{
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    active: u.active ?? true,
                  }}
                  setRefetch={setRefetch}
                />
                <DeleteConfirmDialog
                  message="Are you sure you want to delete this user?"
                  onConfirm={async () => {
                    try {
                      await axiosInstance.delete(`/users/${u.id}`);
                      setRefetch((prev) => !prev);
                    } catch (error) {
                      if (error instanceof AxiosError) {
                        toast.error(
                          error.response?.data?.message ??
                            "Failed to delete user",
                        );
                      } else {
                        toast.error(
                          "An error occurred while deleting the user",
                        );
                      }
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}

          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground"
              >
                No users found.
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
