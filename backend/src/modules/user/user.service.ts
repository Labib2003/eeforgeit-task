import prisma from "@/config/prisma";
import { Prisma } from "@/generated/prisma";
import calculatePagination, { PaginationOptions } from "@/utils/pagination";

const createUser = async (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data });
};

const getUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

const getPaginatedUsers = async (
  filters: { search?: string } & Partial<Prisma.UserWhereInput>,
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

  const conditions: Prisma.UserWhereInput[] = [];

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
    await prisma.user.findMany({
      where: whereConditions,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    }),
    await prisma.user.count({ where: whereConditions }),
  ]);

  return {
    meta: { total, page, limit: take },
    data: result,
  };
};

const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({ where: { id }, data });
};

const deleteUser = async (id: string) => {
  return prisma.user.update({ where: { id }, data: { active: false } });
};

const userService = {
  createUser,
  getUserById,
  getPaginatedUsers,
  updateUser,
  deleteUser,
};
export default userService;
