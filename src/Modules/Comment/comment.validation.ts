import z from "zod";
import { generalaField } from "../../Middlewares/validation.middleware";
import { fileValidation } from "../../Utils/multer/cloud.multer";
export const createCommentSchema = {
  params: z.strictObject({
    postId: generalaField.id,
  }),
  body: z
    .strictObject({
      content: z.string().min(2).max(500000).optional(),
      
      tags: z.array(generalaField.id).max(10).optional(),
    })
    .superRefine((data, ctx) => {

      if ( !data.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Please Provide content or attachments",
        });
      }
      if (
        data.tags?.length &&
        data.tags.length !== [...new Set(data.tags)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Please Provide Unique Tags",
        });
      }
    }),
};
