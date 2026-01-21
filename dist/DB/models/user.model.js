"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
const hash_1 = require("../../Utils/security/hash");
const email_events_1 = require("../../Utils/events/email.events");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "MALE";
    GenderEnum["FEMALE"] = "FEMALE";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["USER"] = "USER";
    RoleEnum["ADMIN"] = "ADMIN";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: false, minlength: 2, maxlength: 25 },
    slug: { type: String, required: true, minlength: 2, maxlength: 51 },
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
    profileImage: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userSchema.pre("save", async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, hash_1.generateHash)(this.password);
    }
    if (this.isModified("confirmEmailOTP")) {
        this.confirmEmailPlainOTP = this.confirmEmailOtp;
        this.confirmEmailOtp = await (0, hash_1.generateHash)(this.confirmEmailOtp);
    }
});
exports.userSchema.post("save", async function (doc, next) {
    const that = this;
    if (that.wasNew && that.confirmEmailOtp) {
        email_events_1.emailEvent.emit("confirmEmail", {
            to: this.email,
            username: this.username,
            otp: that.confirmEmailOtp,
        });
    }
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", exports.userSchema);
