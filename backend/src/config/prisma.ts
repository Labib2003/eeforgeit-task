import { PrismaClient } from "@/generated/prisma/index.js";

const prisma = new PrismaClient({ errorFormat: "minimal" });

export default prisma;
