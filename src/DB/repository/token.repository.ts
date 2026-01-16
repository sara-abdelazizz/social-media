import { IToken } from "../models/token.models";
import { _QueryFilter, Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";

export class TokenRepository extends DatabaseRepository<IToken> {
  constructor(protected override readonly model: Model<IToken>) {
    super(model);
  }
}
