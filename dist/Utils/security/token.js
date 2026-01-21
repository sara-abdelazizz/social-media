"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodedToken = exports.createLoginCredentials = exports.getSigniture = exports.getSignitureLevel = exports.verifyToken = exports.generateToken = exports.LogoutEnum = exports.TokenTypeEnum = exports.signitureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/models/user.model");
const uuid_1 = require("uuid");
const err_response_1 = require("../response/err.response");
const user_repository_1 = require("../../DB/repository/user.repository");
const token_models_1 = require("../../DB/models/token.models");
const token_repository_1 = require("../../DB/repository/token.repository");
var signitureLevelEnum;
(function (signitureLevelEnum) {
    signitureLevelEnum["USER"] = "USER";
    signitureLevelEnum["ADMIN"] = "ADMIN";
})(signitureLevelEnum || (exports.signitureLevelEnum = signitureLevelEnum = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["ACCESS"] = "ACCESS";
    TokenTypeEnum["REFRESH"] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["ALL"] = "ALL";
    LogoutEnum["ONLY"] = "ONLY";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secret, options, }) => {
    return await (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret, }) => {
    return (await (0, jsonwebtoken_1.verify)(token, secret));
};
exports.verifyToken = verifyToken;
const getSignitureLevel = async (role = user_model_1.RoleEnum.USER) => {
    let signiturelevel = signitureLevelEnum.USER;
    switch (role) {
        case user_model_1.RoleEnum.ADMIN:
            signiturelevel = signitureLevelEnum.ADMIN;
            break;
        case user_model_1.RoleEnum.USER:
            signiturelevel = signitureLevelEnum.USER;
            break;
        default:
            break;
    }
    return signiturelevel;
};
exports.getSignitureLevel = getSignitureLevel;
const getSigniture = async (signiturelevel = signitureLevelEnum.USER) => {
    let signitures = {
        access_token: "",
        refresh_token: "",
    };
    switch (signiturelevel) {
        case signitureLevelEnum.ADMIN:
            signitures.access_token = process.env.TOKEN_ACCESS_ADMIN_SECRET;
            signitures.refresh_token = process.env
                .TOKEN_REFRESH_ADMIN_SECRET;
            break;
        case signitureLevelEnum.USER:
            signitures.access_token = process.env.TOKEN_ACCESS_USER_SECRET;
            signitures.refresh_token = process.env
                .TOKEN_REFRESH_USER_SECRET;
        default:
            break;
    }
    return signitures;
};
exports.getSigniture = getSigniture;
const createLoginCredentials = async (user) => {
    const signiturelevel = await (0, exports.getSignitureLevel)(user.role);
    const signitures = await (0, exports.getSigniture)(signiturelevel);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signitures.access_token,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXIPIRE_IN), jwtid },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signitures.refresh_token,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXIPIRE_IN), jwtid },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokenType = TokenTypeEnum.ACCESS, }) => {
    const userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    const tokenModel = new token_repository_1.TokenRepository(token_models_1.TokenModel);
    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token)
        throw new err_response_1.UnauthorizedExeption("missing token part");
    const signitures = await (0, exports.getSigniture)(bearer);
    const decoded = await (0, exports.verifyToken)({
        token,
        secret: tokenType === TokenTypeEnum.REFRESH
            ? signitures.refresh_token
            : signitures.access_token,
    });
    if (!decoded?._id || !decoded.iat)
        throw new err_response_1.UnauthorizedExeption("invalid token payload");
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } }))
        throw new err_response_1.NotFoundExeption("invalid or old login credentials");
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user)
        throw new err_response_1.NotFoundExeption("user not found");
    if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000)
        throw new err_response_1.UnauthorizedExeption("Logged Out From All Devices");
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new token_repository_1.TokenRepository(token_models_1.TokenModel);
    const [results] = (await tokenModel.create({
        data: [
            {
                jti: decoded.jti,
                expiresIn: decoded.iat,
                userId: decoded._id,
            },
        ],
    })) || [];
    if (!results)
        throw new err_response_1.BadRequestExeption("Failed to revoke token");
    return results;
};
exports.createRevokeToken = createRevokeToken;
