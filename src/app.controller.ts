import express from "express"
import type { Express, NextFunction, Request, Response } from "express"
import cors from "cors"
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { config } from "dotenv";
import authRouter from "./Modules/Auth/auth.controller";
import userRouter from "./Modules/User/user.controller";
import { globalHandlerError } from "./Utils/response/err.response";
import connectDB from "./DB/connection";


config({ path: path.resolve("./config/.env.dev") })


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        message: "Too many requests , Please try again later"
    }
});

const bootstrap = async () => {

    const app: Express = express();
    const port: number = Number(process.env.PORT) || 5000;

    app.use(cors(), express.json(), helmet());
    app.use(limiter);
    await connectDB();
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/user", userRouter);





    app.get("/", (req: Request, res: Response) => {
        res.status(200).json({ message: " welcome to social media app" })
    })
app.use("{*dummy}", (req: Request, res: Response) => {
        res.status(404).json({ message: "Not found handler" });
    });



    app.use(globalHandlerError)

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })

}

export default bootstrap;