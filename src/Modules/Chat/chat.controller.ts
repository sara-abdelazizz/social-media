import { Router } from "express";
import { authintication } from "../../Middlewares/authintication.middleware";
import { endpoint } from "./chat.authorization";
import { TokenTypeEnum } from "../../Utils/security/token";
import * as validators from "./chat.validation"
import { validation } from "../../Middlewares/validation.middleware";
import  ChatService from "./chat.service";
const router: Router = Router();

router.get("/", authintication(TokenTypeEnum.ACCESS, endpoint.getChat), validation(validators.getChatSchema), ChatService.getChat);
export default router;
