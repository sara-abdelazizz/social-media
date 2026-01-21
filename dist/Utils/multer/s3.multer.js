"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFiles = exports.deleteFile = exports.createGetPresignedUrl = exports.getFile = exports.createPresignedUrl = exports.uploadFiles = exports.uploadLargeFiles = exports.fileUpload = exports.s3Config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const cloud_multer_1 = require("./cloud.multer");
const uuid_1 = require("uuid");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const err_response_1 = require("../response/err.response");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Config = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
};
exports.s3Config = s3Config;
const fileUpload = async ({ storageApproach = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const key = `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: key,
        Body: storageApproach === cloud_multer_1.StorageEnum.MEMORY ? file.buffer : file.path,
        ContentType: file.mimetype,
    });
    await (0, exports.s3Config)().send(command);
    return key;
};
exports.fileUpload = fileUpload;
const uploadLargeFiles = async ({ storageApproach = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3Config)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`,
            Body: storageApproach === cloud_multer_1.StorageEnum.MEMORY ? file.buffer : file.path,
            ContentType: file.mimetype,
        },
        partSize: 500 * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log("upload progress", progress);
    });
    const { Key } = await upload.done();
    if (!Key)
        throw new err_response_1.BadRequestExeption("fail to upload file");
    return Key;
};
exports.uploadLargeFiles = uploadLargeFiles;
const uploadFiles = async ({ storageApproach = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, }) => {
    let urls = [];
    urls = await Promise.all(files.map((file) => {
        return (0, exports.fileUpload)({
            storageApproach,
            Bucket,
            ACL,
            path,
            file,
        });
    }));
    return urls;
};
exports.uploadFiles = uploadFiles;
const createPresignedUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, path = "general", ContentType, originalname, expiresIn = 120, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-presigned-${originalname}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    if (!url || !command?.input.Key) {
        throw new err_response_1.BadRequestExeption("fail to generate url");
    }
    return { url, Key: command.input.Key };
};
exports.createPresignedUrl = createPresignedUrl;
const getFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
    });
    return await (0, exports.s3Config)().send(command);
};
exports.getFile = getFile;
const createGetPresignedUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, expiresIn = 120, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    if (!url) {
        throw new err_response_1.BadRequestExeption("fail to generate url");
    }
    return url;
};
exports.createGetPresignedUrl = createGetPresignedUrl;
const deleteFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket,
        Key,
    });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, urls, Quiet = false }) => {
    const Objects = urls.map((url) => {
        return { Key: url };
    });
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet,
        }
    });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFiles = deleteFiles;
