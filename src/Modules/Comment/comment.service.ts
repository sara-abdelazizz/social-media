import { Request, Response } from "express";
import { CommentModel } from "../../DB/models/comment.model";
import { AllowCommentsEnum, PostModel } from "../../DB/models/post.model";
import { UserModel } from "../../DB/models/user.model";
import { CommentRepository } from "../../DB/repository/comment.repository";
import { PostRepository } from "../../DB/repository/post.repository ";
import { UserRepository } from "../../DB/repository/user.repository";
import { postAvailability } from "../Post/post.service";
import {
  BadRequestExeption,
  NotFoundExeption,
} from "../../Utils/response/err.response";
import { uploadFiles } from "../../Utils/multer/s3.multer";

class commentService {
  private _userModel = new UserRepository(UserModel);
  private _postModel = new PostRepository(PostModel);
  private _commentModel = new CommentRepository(CommentModel);

  constructor() {}

  createComment = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: string };
    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
        allowComments: AllowCommentsEnum.ALLOW,
      },
    });
    if (!post) throw new NotFoundExeption("fail to match results");
    if (
      req.body.tags?.length &&
      (await this._userModel.find({ filter: { _id: req.body.tags } }))
        .length !== req.body.tags.length
    ) {
      throw new NotFoundExeption("Some Mentioned Tags Does Not Exist");
    }
    let attachments: string[] = [];

    if (req.files?.length) {
      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `user/${req.user?._id}/post/${post.assetPostFolderId}`,
      });

      const [comment] =
        (await this._commentModel.create({
          data: [
            {
              ...req.body,
              attachments,
              postId,
              createdBy: req.user?._id,
            },
          ],
        })) || [];
      if (!post) throw new BadRequestExeption("Fail To Create A Comment");
      return res
        .status(201)
        .json({ message: "comment created successfully", comment });
    }
  };
}
export default new commentService();
