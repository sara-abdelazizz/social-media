"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalaField = exports.validation = void 0;
const err_response_1 = require("../Utils/response/err.response");
const z = __importStar(require("zod"));
const validation = (Schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(Schema)) {
            if (!Schema[key])
                continue;
            const validationResults = Schema[key].safeParse(req[key]);
            if (!validationResults.success) {
                const errors = validationResults.error;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path };
                    })
                });
            }
            if (validationErrors.length > 0) {
                throw new err_response_1.BadRequestExeption("validation error", { cause: validationErrors });
            }
        }
        return next();
    };
};
exports.validation = validation;
exports.generalaField = {
    username: z
        .string({ error: "Username is required" })
        .min(3, { error: "Username must be at least 3 characters long" })
        .max(30, { error: "Username must be at most 30 characters long" }),
    email: z.email({ error: "Invalid email address" }),
    password: z.string(),
    confirmPassword: z.string(),
    otp: z.string().regex(/^\d{6}$/)
};
