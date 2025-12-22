import { BadRequestExeption } from "../../Utils/response/err.response";
import { IUser } from "../models/user.model";
import { DatabaseRepository } from "./database.repository";
import { CreateOptions, Model } from "mongoose";


export class UserRepository extends DatabaseRepository<IUser> {
    constructor(protected override readonly model: Model<IUser>) {
        super(model);
    }
    async createUser({
        data = [],
        options = {}
    }: {
        data: Partial<IUser>[];
        options?: CreateOptions
    }) {
        const [user] = (await this.create({ data, options }) || []);

        if (!user) {
            throw new BadRequestExeption("failed to signup")
        }
        return user;
    }

}