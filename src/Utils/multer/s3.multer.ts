import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { Upload } from "@aws-sdk/lib-storage";
import { BadRequestExeption } from "../response/err.response";


export const s3Config = () => {
  return new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
};

export const fileUpload = async ({
  storageApproach = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
      file.originalname
    }`,
    Body: storageApproach === StorageEnum.MEMORY ? file.buffer : file.path,
    ContentType: file.mimetype,
  });

  await s3Config().send(command);
};

export const uploadLargeFiles = async ({
  storageApproach = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const upload = new Upload({
    client: s3Config(),
    params: {
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
        file.originalname
      }`,
      Body: storageApproach === StorageEnum.MEMORY ? file.buffer : file.path,
      ContentType: file.mimetype,
    },
    partSize: 500 * 1024 * 1024,
  });
  upload.on("httpUploadProgress", (progress) => {
    console.log("upload progress", progress);
  });
  const { Key } = await upload.done();

  if (!Key) throw new BadRequestExeption("fail to upload file");

  return Key;
};

export const uploadFiles = async ({
  storageApproach = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}) => {
  let urls: string[] = [];

  urls = await Promise.all(
    files.map((file) => {
      return fileUpload({
        storageApproach,
        Bucket,
        ACL,
        path,
        file,
      });
    })
  );
  //   for (const file of files) {
  //     const key = await fileUpload({
  //       storageApproach,
  //       Bucket,
  //       ACL,
  //       path,
  //       file,
  //     });
  //     urls.push(key);
  //   }
  return urls;
};
