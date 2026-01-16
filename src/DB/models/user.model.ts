import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { string } from "zod";

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
    firstName: string;
    lastName: string;
    username?: string;


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
    profileImage:string;

    createdAt?: Date;
    updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
        lastName: { type: String, required: true, minlength: 2, maxlength: 25 },
        email: { type: String, required: true, unique: true },
        confirmEmailOtp: String,
        confirmEmailOtpExpiry: { type: Date },
        confirmedAt: Date,
        changeCredentialsTime: Date,

        password: { type: String, required: true },
        resetpasswordOtp: String,
        phone: String,
        address: String,
        gender: { type: String, enum: Object.values(GenderEnum), default: GenderEnum.MALE },
        role: { type: String, enum: Object.values(RoleEnum), default: RoleEnum.USER },
        profileImage:String
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


userSchema.virtual("username").set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName })
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
})

export const UserModel = models.User || model("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;