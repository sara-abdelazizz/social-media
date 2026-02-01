import { Request, Response } from "express";
import { UserRepository } from "../../DB/repository/user.repository";
import { HUserDocument, UserModel } from "../../DB/models/user.model";
import { PostRepository } from "../../DB/repository/post.repository ";
import {
  AvailabilityEnum,
  LikeUnlikeEnum,
  PostModel,
} from "../../DB/models/post.model";
import {
  BadRequestExeption,
  NotFoundExeption,
} from "../../Utils/response/err.response";
import { v4 as uuid } from "uuid";
import { uploadFiles } from "../../Utils/multer/s3.multer";
import { UpdateQuery } from "mongoose";

export const postAvailability = (req: Request) => {
  return [
    { availability: AvailabilityEnum.PUBLIC },
    { availability: AvailabilityEnum.ONLYME, createdBy: req.user?._id },
    {
      availability: AvailabilityEnum.FRIENDS,
      createdBy: {
        $in: [...(req.user?.friends || []), req.user?._id],
      },
    },
    { availability: AvailabilityEnum.ONLYME, tags: { $in: [req.user?._id] } },
  ];
};

export class PostService {
  private _userModel = new UserRepository(UserModel);
  private _postModel = new PostRepository(PostModel);
  constructor() {}
  createPost = async (req: Request, res: Response) => {
    if (
      req.body.tags?.length &&
      (await this._userModel.find({ filter: { _id: req.body.tags } }))
        .length !== req.body.tags.length
    ) {
      throw new NotFoundExeption("Some Mentioned Tags Does Not Exist");
    }
    let attachments: string[] = [];
    let assetFolder = undefined;

    if (req.files?.length) {
      let assetPostFolderId = uuid();

      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `user/${req.user?._id}/post/${assetPostFolderId}`,
      });
      assetFolder = assetPostFolderId;
    }

    const [post] =
      (await this._postModel.create({
        data: [
          {
            ...req.body,
            attachments,
            assetPostFolderId: assetFolder,
            createdBy: req.user?._id,
          },
        ],
      })) || [];
    if (!post) throw new BadRequestExeption("Fail To Create A Post");

    return res.status(201).json({ message: "Post Created Successfully", post });
  };
  likePost = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: String };
    const { action } = req.query as unknown as { action: String };

    let update: UpdateQuery<HUserDocument> = {
      $addToSet: { likes: req.user?._id },
    };
    if (action === LikeUnlikeEnum.UNLIKE) {
      update = { $pull: { likes: req.user?._id } };
    }
    const post = await this._postModel.findOneAndUpdate({
      filter: { _id: postId },
      update,
    });
    if (!post) throw new NotFoundExeption("Post Does Not Exist");

    return res.status(200).json({ message: "Done", post });
  };
  getAllPosts = async (req: Request, res: Response) => {
    let { page, size } = req.query as unknown as { page: number; size: number };
    const posts = await this._postModel.paginate({
      filter: { availability: AvailabilityEnum.PUBLIC },
      page,
      size,
    });
    return res
      .status(200)
      .json({ message: "Post Fetched Successfully", posts });
  };
}

export default new PostService();
