import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { config } from "dotenv";
import authRouter from "./Modules/Auth/auth.controller";
import userRouter from "./Modules/User/user.controller";
import postRouter from "./Modules/Post/post.controller";
import {
  BadRequestExeption,
  globalHandlerError,
} from "./Utils/response/err.response";
config({ path: path.resolve("./config/.env.dev") });
import connectDB from "./DB/connection";
import {
  createGetPresignedUrl,
  deleteFile,
  getFile,
} from "./Utils/multer/s3.multer";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { intialize } from "./Modules/Gateway/gateway";

const createS3WriteStreamPipe = promisify(pipeline);

config({ path: path.resolve("./config/.env.dev") });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    status: 429,
    message: "Too many requests , Please try again later",
  },
});

const bootstrap = async () => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 3000;

  app.use(cors(), express.json(), helmet());
  app.use(limiter);
  await connectDB();

  app.get("/uploads/pre-signed/*path", async (req, res) => {
    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join("/");
    const url = await createGetPresignedUrl({
      Key,
    });

    return res.status(200).json({ message: "done", url });
  });
  app.get("/uploads/*path", async (req, res) => {
    const { downloadName } = req.query;
    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join("/");
    const s3Response = await getFile({ Key });

    if (!s3Response.Body) {
      throw new BadRequestExeption("file not found");
    }
    res.setHeader(
      "Content-Type",
      s3Response.ContentType || "application/octet-stream",
    );

    if (downloadName) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadName}"`,
      );
    }

    return await createS3WriteStreamPipe(
      s3Response.Body as NodeJS.ReadableStream,
      res,
    );
  });
  app.get("/test-s3", async (req: Request, res: Response) => {
    const { Key } = req.query as { Key: string };
    const results = await deleteFile({ Key: Key as string });
    return res.status(200).json({ message: "done", results });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/post", postRouter);
  app.use("/api/user", userRouter);

  // app.get("/", (req: Request, res: Response) => {
  //   res.status(200).json({ message: " welcome to social media app" });
  // });
  app.use("{*dummy}", (req: Request, res: Response) => {
    res.status(404).json({ message: "Not found handler" });
  });

  app.use(globalHandlerError);

  const httpServer = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  intialize(httpServer);
};

export default bootstrap;
