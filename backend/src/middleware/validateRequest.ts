import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";

const validateRequest =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
      });
      req.body = parsed.body;
      req.query = parsed.query;
      return next();
    } catch (error) {
      return next(error);
    }
  };

export default validateRequest;
