"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authintication = void 0;
const token_1 = require("../Utils/security/token");
const err_response_1 = require("../Utils/response/err.response");
const authintication = (tokenType = token_1.TokenTypeEnum.ACCESS, accessRoles = []) => {
    return async (req, res, next) => {
        if (!req.headers.authorization)
            throw new err_response_1.BadRequestExeption("missing authorization header");
        const { decoded, user } = await (0, token_1.decodedToken)({
            authorization: req.headers.authorization,
            tokenType,
        });
        if (!accessRoles.includes(user.role))
            throw new err_response_1.ForbbidenExeption("you are not authorized to access this route");
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authintication = authintication;
