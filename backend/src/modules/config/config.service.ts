import prisma from "@/config/prisma";
import { Prisma } from "@/generated/prisma";

const getConfig = async () => {
  return prisma.config.findFirst();
};

const updateConfig = async (data: Prisma.ConfigUpdateInput) => {
  return prisma.config.updateMany({
    where: {},
    data,
  });
};

const configService = {
  getConfig,
  updateConfig,
};
export default configService;
