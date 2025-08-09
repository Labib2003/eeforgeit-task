import { z } from "zod";

const configSchema = z.strictObject({
  examLengthInMinutes: z.number().int().positive(),
});

const updateConfigSchema = z.object({
  body: configSchema.partial(),
});

const configValidator = {
  updateConfigSchema,
};
export default configValidator;
