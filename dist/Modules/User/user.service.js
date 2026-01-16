"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const s3_multer_1 = require("../../Utils/multer/s3.multer");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    getProfile = async (req, res) => {
        return res.status(200).json({
            message: "done",
            data: { user: req.user, decoded: req.decoded },
        });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_1.LogoutEnum.ONLY:
                await (0, token_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
            case token_1.LogoutEnum.ALL:
                update.changeCredentialsTime = new Date();
                break;
            default:
                break;
        }
        await this._userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.status(statusCode).json({ message: "done" });
    };
    profileImage = async (req, res) => {
        const Key = await (0, s3_multer_1.fileUpload)({
            path: `users/${req.decoded?._id}`,
            file: req.file,
        });
        await this._userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update: {
                profileImage: Key,
            },
        });
        return res.status(200).json({ message: "done" });
    };
}
exports.default = new UserService();
