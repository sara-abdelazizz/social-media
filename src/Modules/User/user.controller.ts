import { Router } from "express";
import userService from "./user.service"
import { authintication } from "../../Middlewares/authintication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";

const router: Router = Router();

router.get("/profile", authintication(TokenTypeEnum.ACCESS, [RoleEnum.USER]), userService.getProfile);




export default router;