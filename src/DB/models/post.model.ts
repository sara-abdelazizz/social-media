import { Types, HydratedDocument, Schema, models, model } from "mongoose";
import { string } from "zod";

export enum AllowCommentsEnum {
  ALLOW = "ALLOW",
  DENY = "DENY",
}

export enum AvailabilityEnum {
  PUBLIC = "PUBLIC",
  FRIENDS = "FRIENDS",
  ONLYME = "ONLYME",
}

export enum LikeUnlikeEnum {
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
}

export interface IPost {
  content?: string;
  attachments?: string[];
  assetPostFolderId?: string;

  allowComments: AllowCommentsEnum;
  availability: AvailabilityEnum;

  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];

  createdBy: Types.ObjectId;

  freezedBy?: Types.ObjectId;
  freezedAt?: Date;

  restoredBy?: Types.ObjectId;
  restoredAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type HPostDocument = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 500000,
      required: function (this: IPost): boolean {
        return !this.attachments?.length;
      },
    },
    assetPostFolderId: string,
    attachments: [String],
    allowComments: {
      type: String,
      enum: Object.values(AllowCommentsEnum),
      default: AllowCommentsEnum.ALLOW,
    },
    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.PUBLIC,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],

    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    freezedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    freezedAt: Date,

    restoredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    restoredAt: Date,
  },
  { timestamps: true },
);

export const PostModel = models.post || model<IPost>("Post", postSchema);
