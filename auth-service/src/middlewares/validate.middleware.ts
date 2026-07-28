import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";

const validateFields = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors });
    }
    req.body = result.data;
    next();
  };
};

module.exports = validateFields;