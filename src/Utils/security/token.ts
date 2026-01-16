import { sign, verify, Secret, SignOptions, JwtPayload } from "jsonwebtoken"
import { HUserDocument, RoleEnum, UserModel } from "../../DB/models/user.model";
import { v4 as uuid } from "uuid"
import { BadRequestExeption, NotFoundExeption, UnauthorizedExeption } from "../response/err.response";
import { UserRepository } from "../../DB/repository/user.repository";
import { TokenModel } from "../../DB/models/token.models";
import { TokenRepository } from "../../DB/repository/token.repository"


export enum signitureLevelEnum {
    USER = "USER",
    ADMIN = "ADMIN",
}

export enum TokenTypeEnum {
    ACCESS = "ACCESS",
    REFRESH = "REFRESH",
}

export enum LogoutEnum {
    ALL = "ALL",
    ONLY = "ONLY",
}

export const generateToken = async ({
    payload,
    secret,
    options
}: {
    payload: object;
    secret: Secret;
    options: SignOptions
}): Promise<string> => {
    return await sign(payload, secret, options)
}

export const verifyToken = async ({
    token,
    secret,

}: {
    token: string;
    secret: Secret;
}): Promise<JwtPayload> => {
    return await verify(token, secret) as JwtPayload
}

export const getSignitureLevel = async (role: RoleEnum = RoleEnum.USER) => {
    let signiturelevel: signitureLevelEnum = signitureLevelEnum.USER;

    switch (role) {
        case RoleEnum.ADMIN:
            signiturelevel = signitureLevelEnum.ADMIN
            break;
        case RoleEnum.USER:
            signiturelevel = signitureLevelEnum.USER
            break;
        default:
            break

    }
    return signiturelevel;

};

export const getSigniture = async (
    signiturelevel: signitureLevelEnum = signitureLevelEnum.USER
): Promise<{ access_token: string; refresh_token: string }> => {
    let signitures: { access_token: string; refresh_token: string } = {
        access_token: "",
        refresh_token: "",
    }
    switch (signiturelevel) {
        case signitureLevelEnum.ADMIN:
            signitures.access_token = process.env.TOKEN_ACCESS_ADMIN_SECRET as string
            signitures.refresh_token = process.env.TOKEN_REFRESH_ADMIN_SECRET as string

            break;
        case signitureLevelEnum.USER:
            signitures.access_token = process.env.TOKEN_ACCESS_USER_SECRET as string
            signitures.refresh_token = process.env.TOKEN_REFRESH_USER_SECRET as string
        default:
            break
    }
    return signitures;
}

export const createLoginCredentials = async (user: HUserDocument): Promise<{ access_token: string; refresh_token: string }> => {
    const signiturelevel = await getSignitureLevel(user.role);
    const signitures = await getSigniture(signiturelevel)
    const jwtid = uuid()

    const access_token = await generateToken({
        payload: { _id: user._id },
        secret: signitures.access_token,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXIPIRE_IN), jwtid, }
    })

    const refresh_token = await generateToken({
        payload: { _id: user._id },
        secret: signitures.refresh_token,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXIPIRE_IN), jwtid, }
    })

    return { access_token, refresh_token }

}

export const decodedToken = async ({
    authorization,
    tokenType = TokenTypeEnum.ACCESS,
}: {
    authorization: string; tokenType?: TokenTypeEnum;
}) => {

    const userModel = new UserRepository(UserModel)
    const tokenModel = new TokenRepository(TokenModel)

    const [bearer, token] = authorization.split(" ")
    if (!bearer || !token) throw new UnauthorizedExeption("missing token part")

    const signitures = await getSigniture(bearer as signitureLevelEnum)

    const decoded = await verifyToken({
        token,
        secret:
            tokenType === TokenTypeEnum.REFRESH
                ? signitures.refresh_token
                : signitures.access_token
    })
    if (!decoded?._id || !decoded.iat)
        throw new UnauthorizedExeption("invalid token payload");


    if (await tokenModel.findOne({ filter: { jti: decoded.jti as string } }))
        throw new NotFoundExeption("invalid or old login credentials")


    const user = await userModel.findOne({ filter: { _id: decoded._id } })
    if (!user) throw new NotFoundExeption("user not found")

    if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000)
        throw new UnauthorizedExeption("Logged Out From All Devices")

    return { user, decoded }

}

export const createRevokeToken = async (decoded: JwtPayload) => {
    const tokenModel = new TokenRepository(TokenModel)

    const [results] = await tokenModel.create({
        data: [
            {
                jti: decoded.jti as string,
                expiresIn: decoded.iat as number,
                userId: decoded._id,
            },
        ],
    }) || []

    if (!results) throw new BadRequestExeption("Failed to revoke token")

    return results

}