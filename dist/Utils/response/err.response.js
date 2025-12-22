"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalHandlerError = exports.ConflictExeption = exports.NotFoundExeption = exports.BadRequestExeption = exports.ApplicationExeption = void 0;
class ApplicationExeption extends Error {
    statusCode;
    constructor(message, statusCode, options) {
        super(message, options);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
exports.ApplicationExeption = ApplicationExeption;
class BadRequestExeption extends ApplicationExeption {
    constructor(message, options) {
        super(message, 400, options);
    }
}
exports.BadRequestExeption = BadRequestExeption;
class NotFoundExeption extends ApplicationExeption {
    constructor(message, options) {
        super(message, 404, options);
    }
}
exports.NotFoundExeption = NotFoundExeption;
class ConflictExeption extends ApplicationExeption {
    constructor(message, options) {
        super(message, 409, options);
    }
}
exports.ConflictExeption = ConflictExeption;
const globalHandlerError = (err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "something went wrong",
        stack: process.env.MODE === "DEV" ? err.stack : undefined,
        cause: err.cause
    });
};
exports.globalHandlerError = globalHandlerError;
