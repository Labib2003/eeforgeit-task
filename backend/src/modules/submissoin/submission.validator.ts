import { EvaluationLevel, EvaluationStep } from "@/generated/prisma";
import { z } from "zod";

const submissionSchema = z.strictObject({
  step: z.nativeEnum(EvaluationStep),
  questionsAndAnswers: z
    .array(
      z.strictObject({
        question: z.string(),
        imageUrl: z.string().optional(),
        answer: z.string(),
      }),
    )
    .min(1),
});

const createSubmissionSchema = z.object({
  body: submissionSchema,
});

const updateSubmissionSchema = z.object({
  body: submissionSchema.partial().extend({
    level: z.nativeEnum(EvaluationLevel).optional(),
  }),
});

const submissionValidator = {
  createSubmissionSchema,
  updateSubmissionSchema,
};
export default submissionValidator;
