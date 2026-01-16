import { Router } from "express";
import userService from "./user.service"
import { authintication } from "../../Middlewares/authintication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validation.middleware";
import { logoutSchema } from "./user.validation";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utils/multer/cloud.multer";

const router: Router = Router();

router.get(
    "/profile",
    authintication(
        TokenTypeEnum.ACCESS,
        [RoleEnum.USER]
    ),

    userService.getProfile
);


router.post(
    "/logout",
    authintication(
        TokenTypeEnum.ACCESS,
        [RoleEnum.USER]
    ), validation(logoutSchema),

    userService.logout
);

router.patch(
    "/profile-image",
    authintication(
        TokenTypeEnum.ACCESS,
        [RoleEnum.USER]
    ), cloudFileUpload({
        validation: fileValidation.images,
        storageApproach: StorageEnum.MEMORY,
        maxSizeMb: 6,
    }).single("attachments"),

    userService.profileImage,
);

router.patch(
    "/cover-image",
    authintication(
        TokenTypeEnum.ACCESS,
        [RoleEnum.USER]
    ), cloudFileUpload({
        validation: fileValidation.images,
        storageApproach: StorageEnum.MEMORY,
        maxSizeMb: 6,
    }).array("attachments",5),

    userService.coverImage,
);



export default router;