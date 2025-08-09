import { Role } from "@/generated/prisma";
import { z } from "zod";

const userSchema = z.strictObject({
  name: z.string().optional(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

const createUserSchema = z.object({
  body: userSchema,
});

const updateUserSchema = z.object({
  body: userSchema.partial().extend({ active: z.boolean().optional() }),
});

const userValidator = {
  createUserSchema,
  updateUserSchema,
};
export default userValidator;
