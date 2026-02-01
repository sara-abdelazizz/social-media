import { NextFunction, Request, Response } from "express";
import { BadRequestExeption } from "../Utils/response/err.response";
import { ZodType, ZodError } from "zod";
import * as z from "zod";
import { Types } from "mongoose";

type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (Schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: Array<{
      key: KeyReqType;
      issues: Array<{
        message: string;
        path: (string | number | symbol)[];
      }>;
    }> = [];
    for (const key of Object.keys(Schema) as KeyReqType[]) {
      if (!Schema[key]) continue;

      const validationResults = Schema[key].safeParse(req[key]);
      if (!validationResults.success) {
        const errors = validationResults.error as ZodError;
        validationErrors.push({
          key,
          issues: errors.issues.map((issue) => {
            return { message: issue.message, path: issue.path };
          }),
        });
      }

      if (validationErrors.length > 0) {
        throw new BadRequestExeption("validation error", {
          cause: validationErrors,
        });
      }
    }

    return next() as unknown as NextFunction;
  };
};

export const generalaField = {
  username: z
    .string({ error: "Username is required" })
    .min(3, { error: "Username must be at least 3 characters long" })
    .max(30, { error: "Username must be at most 30 characters long" }),
  email: z.email({ error: "Invalid email address" }),
  password: z.string(),
  confirmPassword: z.string(),
  otp: z.string().regex(/^\d{6}$/),
  file: function (mimetype: string[]) {
    return z
      .strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.enum(mimetype),
        buffer: z.any().optional(),
        path: z.string().optional(),
        size: z.number(),
      })
      .refine(
        (data) => {
          return data.path || data.buffer;
        },
        { error: "Please provide a file" },
      );
  },
  id: z.string().refine(
    (data) => {
      return Types.ObjectId.isValid(data);
    },
    { error: "Invalid tag id" },
  ),
};
