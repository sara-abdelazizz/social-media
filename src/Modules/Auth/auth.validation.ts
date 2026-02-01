import * as z from "zod";
import { generalaField } from "../../Middlewares/validation.middleware";

export const loginSchema = {
  body: z.strictObject({
    email: generalaField.email,
    password: generalaField.password,
  }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    email: generalaField.email,
    otp: generalaField.otp,
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      username: generalaField.username,
      confirmPassword: generalaField.password,
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
      if (data.username?.split(" ").length != 2) {
        ctx.addIssue({
          code: "custom",
          message: "Username must contain first and last name",
          path: ["username"],
        });
      }
    }),
};
