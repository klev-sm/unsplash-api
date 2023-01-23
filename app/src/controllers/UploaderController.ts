import { Request, Response } from "express";

import { ImageModel } from "../models/ImageModel.js";
import jsonResponse from "../helpers/treatingResponses.js";
import { LocalUploader } from "../models/LocalUploader.js";
import { CloudinaryUploader } from "../models/CloudinaryUploader.js";
import { saveImageToDatabase } from "../helpers/databaseOperations.js";
import { UploadApiResponse } from "cloudinary";
import { deleteTempImage } from "../helpers/deleteTempImage.js";
import { updateFields, updateImage } from "../helpers/updateFields.js";
import { error } from "../helpers/treatingErrors.js";

const localUploader = new LocalUploader();
const cloudUploader = new CloudinaryUploader();

// Routes Class
export class UploaderController {
  public static async saveImage(req: Request, res: Response): Promise<void> {
    try {
      // saving image to local temp folder
      const { locallySavedImage, subtitle } = await localUploader.startUpload(req, res);
      if (locallySavedImage !== undefined && subtitle !== undefined) {
        // uploading image to cloud service
        const uploadedImage: UploadApiResponse = await cloudUploader.uploader(
          locallySavedImage,
          {
            transformation: [{ quality: 30 }],
            folder: "images",
          }
        );
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
          });
          if (!databaseSavedImage) {
            throw new Error(databaseSavedImage);
          } else {
            // everything went fine!
            jsonResponse(
              res,
              201,
              "Success on uploading image to Cloudinary and saving it to database",
              {
                id: databaseSavedImage._id,
                imageLink: databaseSavedImage.link!,
                subtitle: subtitle,
              }
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

  public static async getImages(_: Request, res: Response): Promise<void> {
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

  public static async editImage(req: Request, res: Response) {
    try {
      // getting the values from request
      const { id, locallySavedImage, subtitle } = await localUploader.startUpload(
        req,
        res
      );
      if (!id) {
        throw new Error("Image id not found.");
      } else {
        // searching for id on database
        const foundImage = await ImageModel.findById(id);
        if (!foundImage) {
          throw new Error("Not found saved image from the given id.");
        }
        // verifying and validating every request fields (without image)
        if (subtitle !== undefined && subtitle?.length !== 0) {
          // updating passed fields
          updateFields([{ subtitle: subtitle }], foundImage);
        }
        // getting image because comes from other object (req.file)
        if (locallySavedImage !== undefined) {
          updateImage(locallySavedImage, cloudUploader, foundImage.publicID!);
        }
        jsonResponse(res, 201, "Image successfully updated.");
      }
    } catch (error: any) {
      jsonResponse(res, 400, "Failed to update image.", error.toString());
    }
  }

  public static async deleteImage(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      if (id === undefined) {
        error("Can't find an undefined id.", "Not Found.");
      } else {
        const image = await ImageModel.findById(id);
        if (image) {
          const imagePublicID = image.publicID;
          // deleting image from Cloudinary
          const cloudinaryDeletedImage = await cloudUploader.destroyer(imagePublicID!);
          if (cloudinaryDeletedImage) {
            // deleting image from Mongo database
            const databaseDeletedImage = await ImageModel.deleteOne({
              publicID: imagePublicID,
            });
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
        } else {
          error("Image does not exists.", "Not Found");
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
