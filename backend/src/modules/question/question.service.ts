import prisma from "@/config/prisma";
import { EvaluationStep, Prisma } from "@/generated/prisma";
import ApiError from "@/utils/ApiError";
import calculatePagination, { PaginationOptions } from "@/utils/pagination";
import { status as httpStatus } from "http-status";

const createQuestion = async (data: Prisma.QuestionCreateInput) => {
  const questionsOfSameStepCount = await prisma.question.count({
    where: { step: data.step },
  });

  if (questionsOfSameStepCount >= 44)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only create a maximum of 44 questions for each step.",
    );
  else return prisma.question.create({ data });
};

const getQuestionById = async (id: string) => {
  return prisma.question.findUnique({ where: { id } });
};

const getPaginatedQuestions = async (
  filters: { search?: string } & Partial<Prisma.QuestionWhereInput>,
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

  const conditions: Prisma.QuestionWhereInput[] = [];

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
    await prisma.question.findMany({
      where: whereConditions,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    }),
    await prisma.question.count({ where: whereConditions }),
  ]);

  return {
    meta: { total, page, limit: take },
    data: result,
  };
};

const updateQuestion = async (id: string, data: Prisma.QuestionUpdateInput) => {
  const questionsOfSameStepCount = await prisma.question.count({
    where: { step: data.step as EvaluationStep },
  });

  if (data.step && questionsOfSameStepCount >= 44)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only create a maximum of 44 questions for each step.",
    );
  else return prisma.question.update({ where: { id }, data });
};

const deleteQuestion = async (id: string) => {
  return prisma.question.delete({ where: { id } });
};

const questionService = {
  createQuestion,
  getQuestionById,
  getPaginatedQuestions,
  updateQuestion,
  deleteQuestion,
};
export default questionService;
