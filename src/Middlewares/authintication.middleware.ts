import { NextFunction, Request, Response } from "express";
import { RoleEnum } from "../DB/models/user.model";
import { decodedToken, TokenTypeEnum } from "../Utils/security/token";
import { BadRequestExeption, ForbbidenExeption } from "../Utils/response/err.response";





export const authintication = (
    tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
    accessRoles: RoleEnum[] = []
) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization)
            throw new BadRequestExeption("missing authorization header")

        const { decoded, user } = await decodedToken({
            authorization: req.headers.authorization,
            tokenType,
        })

        if (!accessRoles.includes(user.role))
            throw new ForbbidenExeption("you are not authorized to access this route")
        req.user = user;
        req.decoded = decoded;
        return next()
    }

}