import { Category } from "@/generated/prisma";
import { z } from "zod";

const createPostSchema = z.object({
  body: z.strictObject({
    title: z.string(),
    body: z.string(),
    category: z.nativeEnum(Category),
  }),
});

const updatePostSchema = z.object({
  body: z.strictObject({
    title: z.string().optional(),
    body: z.string().optional(),
    category: z.nativeEnum(Category).optional(),
  }),
});

const postValidator = { createPostSchema, updatePostSchema };
export default postValidator;
