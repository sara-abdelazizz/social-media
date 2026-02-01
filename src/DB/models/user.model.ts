import {
  HydratedDocument,
  model,
  models,
  Schema,
  Types,
  UpdateQuery,
} from "mongoose";

import { TokenRepository } from "../repository/token.repository";
import { TokenModel } from "./token.models";
import { generateHash } from "../../Utils/security/hash";
import { emailEvent } from "../../Utils/events/email.events";

export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum RoleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface IUser {
  _id: Types.ObjectId;
  firstName?: string;
  lastName: string;
  username?: string;
  slug?: string;

  email: string;
  confirmEmailOtp?: string;
  confirmedAt?: Date;
  confirmEmailOtpExpiry?: Date;
  changeCredentialsTime: Date;

  password: string;
  resetpasswordOtp?: string;

  phone?: string;
  address?: string;
  gender?: GenderEnum;
  role: RoleEnum;
  profileImage: string;

  createdAt?: Date;
  updatedAt?: Date;
  friends?: Types.ObjectId[];
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: false, minlength: 2, maxlength: 25 },
    slug: { type: String, required: false, minlength: 2, maxlength: 51 },

    email: { type: String, required: true, unique: true },
    confirmEmailOtp: String,
    confirmEmailOtpExpiry: { type: Date },
    confirmedAt: Date,
    changeCredentialsTime: Date,

    password: { type: String, required: true },
    resetpasswordOtp: String,
    phone: String,
    address: String,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profileImage: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

// userSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
//   const query = this.getQuery();
//   const update = this.getUpdate() as UpdateQuery<HUserDocument>;
//   if (update.freezedAt) {
//     this.setUpdate({ ...update, changeCredentialsTime: new Date() });
//   }
// });
// userSchema.post("findOneAndUpdate", async function (next) {
//   const query = this.getQuery();
//   const update = this.getUpdate() as UpdateQuery<HUserDocument>;
//   if (update["$set"].changeCredentialsTime) {
//     const tokenModel = new TokenRepository(TokenModel);
//     await tokenModel.deleteMany({ filter: { userId: query._id } });
//   }
// });

// userSchema.pre("findOneAndDelete", async function (next) {
//   const query = this.getQuery();
//   const tokenModel = new TokenRepository(TokenModel);
//   await tokenModel.deleteMany({ filter: { userId: query._id } });
// });

userSchema.pre(
  "save",
  async function (
    this: HUserDocument & { wasNew: boolean; confirmEmailPlainOTP?: string },
    next,
  ) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
      this.password = await generateHash(this.password);
    }
    if (this.isModified("confirmEmailOTP")) {
      this.confirmEmailPlainOTP = this.confirmEmailOtp as string;
      this.confirmEmailOtp = await generateHash(this.confirmEmailOtp as string);
    }
  },
);
userSchema.post("save", async function (doc, next) {
  const that = this as unknown as HUserDocument & {
    wasNew: boolean;
    confirmEmailOtp?: string;
  };
  if (that.wasNew && that.confirmEmailOtp) {
    emailEvent.emit("confirmEmail", {
      to: this.email,
      username: this.username,
      otp: that.confirmEmailOtp,
    });
  }
});

export const UserModel = models.User || model("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
