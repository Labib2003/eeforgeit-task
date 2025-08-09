import prisma from "@/config/prisma";
import { Prisma } from "@/generated/prisma";
import calculatePagination, { PaginationOptions } from "@/utils/pagination";

const createSubmission = async (data: Prisma.SubmissionCreateInput) => {
  return prisma.submission.create({ data });
};

const getSubmissionById = async (id: string) => {
  return prisma.submission.findUnique({ where: { id } });
};

const getPaginatedSubmissions = async (
  filters: { search?: string } & Partial<Prisma.SubmissionWhereInput>,
  options: PaginationOptions,
) => {
  const {
    limit: take,
    skip,
    page,
    sortBy,
    sortOrder,
  } = calculatePagination(options);
  const { search, ...filterData } = filters;

  const conditions: Prisma.SubmissionWhereInput[] = [];

  // partial match
  if (search) {
    conditions.push({
      OR: ["name"].map((field) => ({
        [field]: {
          contains: search,
          mode: "insensitive",
        },
      })),
    });
  }
  // exact match
  if (Object.keys(filterData).length > 0) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key as keyof typeof filterData],
        },
      })),
    });
  }

  const whereConditions = conditions.length ? { AND: conditions } : {};

  const [result, total] = await Promise.all([
    await prisma.submission.findMany({
      where: whereConditions,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    }),
    await prisma.submission.count({ where: whereConditions }),
  ]);

  return {
    meta: { total, page, limit: take },
    data: result,
  };
};

const updateSubmission = async (
  id: string,
  data: Prisma.SubmissionUpdateInput,
) => {
  return prisma.submission.update({ where: { id }, data });
};

const deleteSubmission = async (id: string) => {
  return prisma.submission.delete({ where: { id } });
};

const submissionService = {
  createSubmission,
  getSubmissionById,
  getPaginatedSubmissions,
  updateSubmission,
  deleteSubmission,
};
export default submissionService;
