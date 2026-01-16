"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const err_response_1 = require("../../Utils/response/err.response");
const database_repository_1 = require("./database.repository");
class UserRepository extends database_repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data = [], options = {}, }) {
        const [user] = (await this.create({ data, options })) || [];
        if (!user) {
            throw new err_response_1.BadRequestExeption("failed to signup");
        }
        return user;
    }
}
exports.UserRepository = UserRepository;
