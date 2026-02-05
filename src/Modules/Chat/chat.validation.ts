import z from "zod";
import { generalaField } from "../../Middlewares/validation.middleware";

export const getChatSchema = {
  params: z.strictObject({
    userId: generalaField.id,
  }),
};
