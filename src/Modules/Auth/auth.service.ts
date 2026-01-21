import { Request, Response } from "express";
import { IConfirmEmailDTO, ILoginDTO, ISignupDTO } from "./auth.dto";
import {
  BadRequestExeption,
  ConflictExeption,
  NotFoundExeption,
} from "../../Utils/response/err.response";
import { UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { generateOtp } from "../../Utils/generateOtp";
import { emailEvent } from "../../Utils/events/email.events";
import { createLoginCredentials } from "../../Utils/security/token";
class authinticationService {
  private _userModel = new UserRepository(UserModel);

  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password }: ISignupDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: { email },
      select: "email",
    });
    if (checkUser) throw new ConflictExeption("User already exists");

    const otp = generateOtp();
    const user = await this._userModel.createUser({
      data: [
        {
          username,
          email,
          password,
          confirmEmailOtp: `${otp}`,
        },
      ],
      options: { validateBeforeSave: true },
    });
  

    return res.status(201).json({ message: "user created successfully", user });
  };

  login = async (req: Request, res: Response) => {
    const { email, password }: ILoginDTO = req.body;
    const user = await this._userModel.findOne({
      filter: { email },
    });
    if (!user) throw new NotFoundExeption("user not found");

    if (!user.confirmedAt) throw new BadRequestExeption("verify your account");

    if (!(await compareHash(password, user.password)))
      throw new BadRequestExeption("invalid password");

    const credentials = await createLoginCredentials(user);
    res
      .status(200)
      .json({ message: "user loggedin successfully", credentials });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmEmailOtp: { $exists: true },
        confirmedAt: { $exists: false },
        // confirmEmailOtpExpiry: new Date(Date.now() + 2 * 60 * 1000)
      },
    });
    if (!user) throw new NotFoundExeption("user not found");

    // if (user.confirmEmailOtpExpiry && new Date() > new Date(user.confirmEmailOtpExpiry)) {
    //     throw new BadRequestExeption("OTP expired");
    // }

    if (!compareHash(otp, user?.confirmEmailOtp as string)) {
      throw new BadRequestExeption("invalid otp");
    }

    await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmedAt: new Date(),
        $unset: { confirmEmailOtp: true, confirmEmailOtpExpiry: true },
      },
    });

    return res.status(200).json({ message: "confirmed successfully" });
  };
}

export default new authinticationService();
