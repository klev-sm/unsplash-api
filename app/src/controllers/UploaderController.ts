import { Request, Response } from "express";
import { UploadApiResponse } from "cloudinary";

import { ImageModel } from "../models/ImageModel.js";
import jsonResponse from "../helpers/treatingResponses.js";
import { saveImageToDatabase } from "../helpers/databaseOperations.js";
import { deleteTempImage } from "../helpers/deleteTempImage.js";
import { updateFields, overrideImage } from "../helpers/updateFields.js";
import { error } from "../helpers/treatingErrors.js";
import { Controller } from "./Controller.js";
import { ICustomRequest, ITokenReturn } from "../models/interfaces/ICustomRequest.js";
import { UserModel } from "../models/UserModel.js";

// Routes Class
export class UploaderController {
  public controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  public async saveImage(req: Request, res: Response): Promise<void> {
    try {
      const token = (req as ICustomRequest).token as ITokenReturn;
      const foundUser = await UserModel.findById(token._id);
      if (!foundUser) {
        throw new Error(
          "Not able to find user with the given token. Verify if it is correct logged in."
        );
      }
      // saving image to local temp folder
      const { locallySavedImage, subtitle } =
        await this.controller.localUploader.startUpload(req, res, "image");
      if (locallySavedImage !== undefined && subtitle !== undefined) {
        // uploading image to cloud service
        const uploadedImage: UploadApiResponse =
          await this.controller.cloudUploader.uploader(locallySavedImage, {
            transformation: [{ quality: 30 }],
            folder: "images",
          });
        // deleting image from temp folder
        const errorOnDelete = deleteTempImage(locallySavedImage);
        if (errorOnDelete) {
          throw new Error(errorOnDelete.message);
        }
        if (!uploadedImage) {
          throw new Error(uploadedImage);
        } else {
          // saving image on MongoDB
          const databaseSavedImage = await saveImageToDatabase({
            uploadedImage: uploadedImage,
            subtitle: subtitle,
            userId: foundUser.id,
          });
          if (!databaseSavedImage) {
            throw new Error(databaseSavedImage);
          } else {
            // everything went fine!
            jsonResponse(
              res,
              201,
              "Success on uploading image to Cloudinary and saving it to database",
              databaseSavedImage
            );
          }
        }
      } else {
        jsonResponse(res, 404, "One or more data requested was not fully returned.");
      }
    } catch (error: any) {
      jsonResponse(res, 403, "Upload Error!", error.message);
    }
  }

  public async getImages(_: Request, res: Response): Promise<void> {
    try {
      const images = await ImageModel.find({});
      if (images) {
        jsonResponse(res, 200, "Success on returning images from database.", images);
      } else {
        throw new Error(images);
      }
    } catch (error) {
      jsonResponse(res, 404, "Failed to return images", error!);
    }
  }

  public async editImage(req: Request, res: Response) {
    try {
      // getting the values from request
      const { id, locallySavedImage, subtitle } =
        await this.controller.localUploader.startUpload(req, res, "image");
      if (!id) {
        throw new Error("Image id not found.");
      } else {
        const token = (req as ICustomRequest).token as ITokenReturn;
        // searching for id and passed token on database
        const foundUserImage = await ImageModel.findOne({
          _id: id,
          userId: token._id,
        });
        //verify if the user that saved the image is the same that is trying to edit it
        if (!foundUserImage) {
          throw new Error("The passed user don't have permissions to edit this image..");
        }
        // verifying and validating every request fields (without image)
        if (subtitle !== undefined) {
          // updating passed fields
          updateFields([{ subtitle: subtitle }], foundUserImage);
        }
        // getting image because comes from other object (req.file)
        if (locallySavedImage !== undefined) {
          overrideImage(
            locallySavedImage,
            this.controller.cloudUploader,
            foundUserImage.publicId!
          );
        }
        jsonResponse(res, 201, "Image successfully updated.");
      }
    } catch (error: any) {
      jsonResponse(res, 400, "Failed to update image.", error.toString());
    }
  }

  public async deleteImage(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      if (id === undefined) {
        error("Can't find an undefined id.", "Not Found.");
      } else {
        //verify if the user that saved the image is the same that is trying to edit it
        const token = (req as ICustomRequest).token as ITokenReturn;
        // searching for id and passed token on database
        const foundImage = await ImageModel.findOne({
          _id: id,
          userId: token._id,
        });
        //verify if the user that saved the image is the same that is trying to edit it
        if (!foundImage) {
          throw new Error(
            "The passed user don't have permissions to delete this image.."
          );
        }
        const imagePublicID = foundImage.publicId;
        // deleting image from Cloudinary
        const cloudinaryDeletedImage = await this.controller.cloudUploader.destroyer(
          imagePublicID!
        );
        if (cloudinaryDeletedImage) {
          // deleting image from Mongo database
          const databaseDeletedImage = foundImage.deleteOne();
          if (databaseDeletedImage) {
            jsonResponse(
              res,
              200,
              "Success on deleting image to database and Cloudinary."
            );
          } else {
            throw new Error(
              "Can't delete image from database. Error: " + databaseDeletedImage
            );
          }
        } else {
          error(
            `Can't delete image from Cloudinary. Error: ${cloudinaryDeletedImage}`,
            "Cloudinary Error"
          );
        }
      }
    } catch (error: any) {
      let statusCode: number = 400;

      if (error.name === "Not Found") {
        statusCode = 404;
      }

      jsonResponse(res, statusCode, "Not able to delete image!", error.message);
    }
  }
}
