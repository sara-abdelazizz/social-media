import multer, { FileFilterCallback } from "multer";
import os from "node:os";
import { v4 as uuid } from "uuid"
import { BadRequestExeption } from "../response/err.response";
import { Request } from "express";


export enum StorageEnum {
    MEMORY = "MEMORY",
    DISK = "DISK",
}

export const fileValidation = {
    images: ["image/jpg", "image/jpeg", "image/png"],
    pdf: ["application/pdf"],
    doc: ["application/msword"]
}

export const cloudFileUpload = ({ validation = [], storageApproach = StorageEnum.MEMORY, maxSizeMb = 2, }:
    { validation?: string[]; storageApproach?: StorageEnum, maxSizeMb?: number }) => {

    const storage =
        storageApproach === StorageEnum.MEMORY
            ? multer.memoryStorage()
            : multer.diskStorage({
                destination: os.tmpdir(),
                filename: (
                    req: Request,
                    file: Express.Multer.File,
                    cb: (error: any, filename: string) => void
                ) => {
                    cb(null, `${uuid()}-${file.originalname}`);
                }
            });

    function fileFilter(
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) {
        if (!validation.includes(file.mimetype)) {
            return cb(new BadRequestExeption("invalid file type"))
        }
        return cb(null, true)
    }

    return multer({ storage, fileFilter, limits: { fileSize: maxSizeMb * 1024 * 1024 } });
}