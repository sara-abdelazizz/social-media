import { Router } from "express";
import commentService from "./comment.service";
import { authintication } from "../../Middlewares/authintication.middleware";
import { endpoint } from "./comment.authorization";
import { TokenTypeEnum } from "../../Utils/security/token";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./comment.validation";
import { cloudFileUpload, fileValidation } from "../../Utils/multer/cloud.multer";

const router: Router = Router({
  mergeParams: true,
});

router.post(
  "/",
  authintication(TokenTypeEnum.ACCESS , endpoint.createComment),
  cloudFileUpload({validation:fileValidation.images}).array("attachments" , 3),
  validation(validators.createCommentSchema),
  commentService.createComment
);

export default router;
