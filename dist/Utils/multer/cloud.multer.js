"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.fileValidation = exports.StorageEnum = void 0;
const multer_1 = __importDefault(require("multer"));
const node_os_1 = __importDefault(require("node:os"));
const uuid_1 = require("uuid");
const err_response_1 = require("../response/err.response");
var StorageEnum;
(function (StorageEnum) {
    StorageEnum["MEMORY"] = "MEMORY";
    StorageEnum["DISK"] = "DISK";
})(StorageEnum || (exports.StorageEnum = StorageEnum = {}));
exports.fileValidation = {
    images: ["image/jpg", "image/jpeg", "image/png"],
    pdf: ["application/pdf"],
    doc: ["application/msword"],
};
const cloudFileUpload = ({ validation = [], storageApproach = StorageEnum.MEMORY, maxSizeMb = 2, }) => {
    const storage = storageApproach === StorageEnum.MEMORY
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination: node_os_1.default.tmpdir(),
            filename: (req, file, cb) => {
                cb(null, `${(0, uuid_1.v4)()}-${file.originalname}`);
            },
        });
    function fileFilter(req, file, cb) {
        if (!validation.includes(file.mimetype)) {
            return cb(new err_response_1.BadRequestExeption("invalid file type"));
        }
        return cb(null, true);
    }
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: { fileSize: maxSizeMb * 1024 * 1024 },
    });
};
exports.cloudFileUpload = cloudFileUpload;
