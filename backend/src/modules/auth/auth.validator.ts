import { z } from "zod";

const generateOtpSchema = z.object({
  query: z.strictObject({
    email: z.string().trim().email().toLowerCase(),
  }),
});

const loginSchema = z.object({
  body: z.strictObject({
    email: z.string().trim().email().toLowerCase(),
    otp: z.string().length(5),
  }),
});

const authValidator = { generateOtpSchema, loginSchema };
export default authValidator;
