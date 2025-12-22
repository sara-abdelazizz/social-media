import { NextFunction, Request, Response } from "express";

export interface IError extends Error {

    statusCode: number;
}

export class ApplicationExeption extends Error {
    constructor(
        message: string,
        public statusCode: number,
        options?: ErrorOptions

    ) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

export class BadRequestExeption extends ApplicationExeption {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 400, options);
    }
}

export class NotFoundExeption extends ApplicationExeption {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 404, options);
    }
}

export class ConflictExeption extends ApplicationExeption {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 409, options);
    }
}

export class UnauthorizedExeption extends ApplicationExeption {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 401, options);
    }
}

export class ForbbidenExeption extends ApplicationExeption {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 403, options);
    }
}


export const globalHandlerError = (
    err: IError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "something went wrong",
        stack: process.env.MODE === "DEV" ? err.stack : undefined,
        cause: err.cause
    })
}
