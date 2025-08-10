import {
  Competency,
  EvaluationLevel,
  EvaluationStep,
} from "@/generated/prisma";
import { z } from "zod";

const questionSchema = z.strictObject({
  question: z.string(),
  imageUrl: z.string().optional(),
  step: z.nativeEnum(EvaluationStep),
  level: z.nativeEnum(EvaluationLevel),
  competency: z.nativeEnum(Competency),
});

const createQuestionSchema = z.object({
  body: questionSchema,
});

const updateQuestionSchema = z.object({
  body: questionSchema.partial(),
});

const questionValidator = { createQuestionSchema, updateQuestionSchema };
export default questionValidator;
