import z from "zod";
import { generalaField } from "../../Middlewares/validation.middleware";
import { fileValidation } from "../../Utils/multer/cloud.multer";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
  LikeUnlikeEnum,
} from "../../DB/models/post.model";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().min(2).max(500000).optional(),
      attachments: z
        .array(generalaField.file(fileValidation.images))
        .max(3)
        .optional(),
      allowComments: z.enum(AllowCommentsEnum).default(AllowCommentsEnum.ALLOW),
      availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC),
      likes: z.array(generalaField.id).optional(),
      tags: z.array(generalaField.id).max(20).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.attachments?.length && !data.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Please Provide Content Or Attachments",
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

export const likePostSchema = {
  params: z.strictObject({
    postId: generalaField.id,
  }),
  query:z.strictObject({
    action:z.enum(LikeUnlikeEnum).default(LikeUnlikeEnum.LIKE)
  })
};
