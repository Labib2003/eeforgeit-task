import prisma from "@/config/prisma";
import { Prisma } from "@/generated/prisma";
import ApiError from "@/utils/ApiError";
import calculatePagination, { PaginationOptions } from "@/utils/pagination";
import { status as httpStatus } from "http-status";

const createSubmission = async (
  data: Prisma.SubmissionUncheckedCreateInput,
) => {
  const existingSubmission = await prisma.submission.findUnique({
    where: {
      submittedById_step: {
        submittedById: data.submittedById,
        step: data.step,
      },
    },
  });

  if (existingSubmission && !existingSubmission.level)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot resubmit before evaluation",
    );
  if (data.step === "A" && existingSubmission?.level === "FAIL")
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot resubmit after failing step A. Contact your instructor for further assistance.",
    );
  if (data.step === "B") {
    const stepASubmission = await prisma.submission.findUnique({
      where: {
        submittedById_step: {
          submittedById: data.submittedById,
          step: "A",
        },
      },
    });

    if (stepASubmission?.level !== "READY_TO_PROCEED")
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You are not eligable to submit step B. Please ensure you have completed step A with ready to proceed level.",
      );
  }
  if (data.step === "C") {
    const stepBSubmission = await prisma.submission.findUnique({
      where: {
        submittedById_step: {
          submittedById: data.submittedById,
          step: "B",
        },
      },
    });

    if (stepBSubmission?.level !== "READY_TO_PROCEED")
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You are not eligable to submit step C. Please ensure you have completed step B with ready to proceed level.",
      );
  }

  return prisma.$transaction(async (tx) => {
    if (existingSubmission)
      await tx.submission.delete({ where: { id: existingSubmission.id } });
    return tx.submission.create({ data });
  });
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
      include: {
        submittedBy: true,
      },
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
