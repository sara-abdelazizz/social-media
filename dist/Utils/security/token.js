"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSigniture = exports.getSignitureLevel = exports.verifyToken = exports.generateToken = exports.signitureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/models/user.model");
var signitureLevelEnum;
(function (signitureLevelEnum) {
    signitureLevelEnum["USER"] = "USER";
    signitureLevelEnum["ADMIN"] = "ADMIN";
})(signitureLevelEnum || (exports.signitureLevelEnum = signitureLevelEnum = {}));
const generateToken = async ({ payload, secret, options }) => {
    return await (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret, }) => {
    return await (0, jsonwebtoken_1.verify)(token, secret);
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
            signitures.refresh_token = process.env.TOKEN_REFRESH_ADMIN_SECRET;
            break;
        case signitureLevelEnum.USER:
            signitures.access_token = process.env.TOKEN_ACCESS_USER_SECRET;
            signitures.refresh_token = process.env.TOKEN_REFRESH_USER_SECRET;
        default:
            break;
    }
    return signitures;
};
exports.getSigniture = getSigniture;
