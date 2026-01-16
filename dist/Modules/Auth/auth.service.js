"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const err_response_1 = require("../../Utils/response/err.response");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const hash_1 = require("../../Utils/security/hash");
const generateOtp_1 = require("../../Utils/generateOtp");
const email_events_1 = require("../../Utils/events/email.events");
const token_1 = require("../../Utils/security/token");
class authinticationService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password } = req.body;
        const checkUser = await this._userModel.findOne({ filter: { email }, select: "email" });
        if (checkUser)
            throw new err_response_1.ConflictExeption("User already exists");
        const otp = (0, generateOtp_1.generateOtp)();
        const user = await this._userModel.createUser({
            data: [{
                    username,
                    email,
                    password: await (0, hash_1.generateHash)(password),
                    confirmEmailOtp: await (0, hash_1.generateHash)(otp)
                }],
            options: { validateBeforeSave: true }
        });
        await email_events_1.emailEvent.emit("confirm email", {
            to: email,
            username,
            otp,
        });
        return res.status(201).json({ message: "user created successfully", user });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({
            filter: { email },
        });
        if (!user)
            throw new err_response_1.NotFoundExeption("user not found");
        if (!user.confirmedAt)
            throw new err_response_1.BadRequestExeption("verify your account");
        if (!(await (0, hash_1.compareHash)(password, user.password)))
            throw new err_response_1.BadRequestExeption("invalid password");
        const credentials = await (0, token_1.createLoginCredentials)(user);
        res.status(200).json({ message: "user loggedin successfully", credentials });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                confirmEmailOtp: { $exists: true },
                confirmedAt: { $exists: false },
            }
        });
        if (!user)
            throw new err_response_1.NotFoundExeption("user not found");
        if (!(0, hash_1.compareHash)(otp, user?.confirmEmailOtp)) {
            throw new err_response_1.BadRequestExeption("invalid otp");
        }
        await this._userModel.updateOne({
            filter: { email },
            update: { confirmedAt: new Date(), $unset: { confirmEmailOtp: true, confirmEmailOtpExpiry: true } },
        });
        return res.status(200).json({ message: "confirmed successfully" });
    };
}
exports.default = new authinticationService();
