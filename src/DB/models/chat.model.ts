import { Types, HydratedDocument, Schema, models, model } from "mongoose";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IChat {
  //OVO
  participants: Types.ObjectId[];
  messages: IMessage[];

  //OVM --> groups
  group?: string;
  group_image?: string;
  roomId?: string;

  //common
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type HChatDocument = HydratedDocument<IChat>;
export type HMessageDocument = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 500000000,
      minlength: 2,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true },
);
const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    group: String,
    group_image: String,
    roomId: {
      type: String,
      required: function () {
        return this.roomId;
      },
    },
    messages: [messageSchema],
  },
  { timestamps: true },
);

export const ChatModel = models.chat || model<IChat>("Chat", chatSchema);
