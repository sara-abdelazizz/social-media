import { Request, Response } from "express";
import { LogoutDTO } from "./user.dto";
import { createRevokeToken, LogoutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import {
  createPresignedUrl,
  uploadFiles,
} from "../../Utils/multer/s3.multer";

class UserService {
  private _userModel = new UserRepository(UserModel);
  constructor() {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
   await req.user?.populate("friends")
    return res.status(200).json({
      message: "done",
      data: { user: req.user, decoded: req.decoded },
    });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutDTO = req.body;
    let statusCode: number = 200;
    const update: UpdateQuery<IUser> = {};

    switch (flag) {
      case LogoutEnum.ONLY:
        await createRevokeToken(req.decoded as JwtPayload);
        statusCode = 201;
        break;
      case LogoutEnum.ALL:
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

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    const {
      ContentType,
      originalname,
    }: { ContentType: string; originalname: string } = req.body;

    const { url, Key } = await createPresignedUrl({
      ContentType,
      originalname,
      path: `users/${req.decoded?._id}`,
    });

    await this._userModel.updateOne({
      filter: { _id: req.decoded?._id },
      update: {
        profileImage: Key,
      },
    });
    return res.status(200).json({ message: "done", url, Key });
  };

  coverImage = async (req: Request, res: Response): Promise<Response> => {
    const urls = await uploadFiles({
      files: req.files as Express.Multer.File[],
      path: `users/${req.decoded?._id}/cover`,
    });
    return res.status(200).json({ message: "done", urls });
  };
}

export default new UserService();
