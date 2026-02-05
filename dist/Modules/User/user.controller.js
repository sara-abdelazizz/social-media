"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authintication_middleware_1 = require("../../Middlewares/authintication.middleware");
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const user_validation_1 = require("./user.validation");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const chat_controller_1 = __importDefault(require("../Chat/chat.controller"));
const router = (0, express_1.Router)();
router.use("/:userId/chat", chat_controller_1.default);
router.get("/profile", (0, authintication_middleware_1.authintication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), user_service_1.default.getProfile);
router.post("/logout", (0, authintication_middleware_1.authintication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validation_middleware_1.validation)(user_validation_1.logoutSchema), user_service_1.default.logout);
router.patch("/profile-image", (0, authintication_middleware_1.authintication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, cloud_multer_1.cloudFileUpload)({
    validation: cloud_multer_1.fileValidation.images,
    storageApproach: cloud_multer_1.StorageEnum.MEMORY,
    maxSizeMb: 6,
}).single("attachments"), user_service_1.default.profileImage);
router.patch("/cover-image", (0, authintication_middleware_1.authintication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, cloud_multer_1.cloudFileUpload)({
    validation: cloud_multer_1.fileValidation.images,
    storageApproach: cloud_multer_1.StorageEnum.MEMORY,
    maxSizeMb: 6,
}).array("attachments", 5), user_service_1.default.coverImage);
exports.default = router;
