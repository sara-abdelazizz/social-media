"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findOne({ filter, select, options, }) {
        const doc = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async find({ filter, select, options, }) {
        const doc = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.limit) {
            doc.limit(options?.limit);
        }
        if (options?.skip) {
            doc.skip(options?.skip);
        }
        return await doc.exec();
    }
    async paginate({ filter = {}, select = {}, options = {}, page = 1, size = 5, }) {
        let docsCount = undefined;
        let pages = undefined;
        page = Math.floor(page < 1 ? 1 : page);
        options.limit = Math.floor(page < 1 || !size ? 5 : size);
        options.skip = (page - 1) * options.limit;
        docsCount = await this.model.countDocuments(filter);
        pages = Math.ceil(docsCount / options.limit);
        const results = await this.find({ filter, select, options });
        return await {
            docsCount,
            pages,
            limit: options.limit,
            currentPage: page,
            results,
        };
    }
    async findOneAndUpdate({ filter, update, options, }) {
        const doc = this.model.findOneAndUpdate(filter, update);
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async findById({ id, select, options, }) {
        const doc = this.model.findById(id).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async updateOne({ filter, update, options, }) {
        return await this.model.updateOne(filter, { ...update, $inc: { __V: 1 } }, options);
    }
    async deleteOne({ filter, }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter, }) {
        return await this.model.deleteMany(filter);
    }
    async findOneAndDelete({ filter, }) {
        return await this.model.findOneAndDelete(filter);
    }
}
exports.DatabaseRepository = DatabaseRepository;
