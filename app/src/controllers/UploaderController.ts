import { Request, RequestHandler, Response } from "express";
import * as multer from "multer";
import { StorageEngine } from "multer";
import { ConfigOptions } from "cloudinary";

import { ImageModel } from "../models/ImageModel.js";
import jsonResponse from "../helpers/jsonResponse.js";

import { LocalUploader } from "../models/LocalUploader.js";
import { CloudUploader } from "../models/CloudUploader.js";

const localUploader = new LocalUploader();
const localStorage: StorageEngine = localUploader.localStorage;
const multerUploader: RequestHandler = localUploader.multerSetup(localStorage);
const cloudUploader: ConfigOptions = CloudUploader.cloudinarySetup();

// Routes Class
// Essa classe ta desorganizada, precisamos organiza-la.
export class UploaderController {
  public saveImage(req: Request, res: Response): void {
    multerUploader(req, res, async (err) => {
      // Treating multer erros
      if (err instanceof multer.MulterError) {
        jsonResponse(
          res,
          500,
          "Multer Error",
          "A Multer error occurred when saving to local folder."
        );
      } else if (err) {
        jsonResponse(
          res,
          500,
          "Multer Error",
          "An unknown error occurred when saving to local folder."
        );
      } else {
        // everything went fine when saving image to local folder
        try {
          if (req.file) {
            const savedImage = req.file.path;
            const cloudinaryUpload = await cloudUploader.uploader.upload(
              savedImage
            );
            if (cloudinaryUpload) {
              const image = await new ImageModel({
                link: cloudinaryUpload.secure_url,
                publicID: cloudinaryUpload.public_id,
              }).save();
              if (image) {
                jsonResponse(
                  res,
                  201,
                  "Success on uploading image to Cloudinary and saving it to database",
                  image?.link!
                );
              } else {
                throw new Error(image);
              }
            } else {
              throw new Error(cloudinaryUpload);
            }
          } else {
            jsonResponse(res, 403, "Invalid image format.");
          }
        } catch (error: any) {
          jsonResponse(res, 403, "Cloudinary Error", error);
        }
      }
    });
  }

  public async getImages(_: Request, res: Response): Promise<void> {
    try {
      const images = await ImageModel.find({});
      if (images) {
        jsonResponse(
          res,
          200,
          "Success on returning images from database.",
          images
        );
      } else {
        throw new Error(images);
      }
    } catch (error) {
      jsonResponse(res, 404, "Failed to return images", error!);
    }
  }

  public editImage(req: Request, res: Response) {
    multerUploader(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        jsonResponse(
          res,
          500,
          "Failed to return images",
          "A Multer error occurred when saving to local folder."
        );
      } else if (err) {
        jsonResponse(
          res,
          500,
          "Multer Error",
          "An unknown error occurred when saving to local folder."
        );
      } else {
        try {
          const publicID: string = req.body.publicID;
          if (publicID) {
            if (req.file) {
              const updatedImage = req.file.path;
              const cloudinaryUpload = await cloudUploader.uploader.upload(
                updatedImage,
                {
                  public_id: publicID,
                  invalidate: true,
                }
              );
              if (cloudinaryUpload) {
                // everything went fine on updating image to Cloudinary
                jsonResponse(res, 201, "Success on updating image to service");
              } else {
                throw new Error(cloudinaryUpload);
              }
            }
          } else {
            throw new Error("Invalid public ID");
          }
        } catch (error: any) {
          jsonResponse(res, 400, "Failed to update image.", error);
        }
      }
    });
  }

  public async deleteImage(req: Request, res: Response) {
    try {
      const publicID: string = req.params.publicID;
      if (publicID === undefined) {
        const err = new Error();
        err.message = "Can't find an undefined public id.";
        err.name = "Not found";
        throw err;
      }
      const cloudinaryDeletedImage = await cloudUploader.uploader.destroy(
        publicID
      );
      if (cloudinaryDeletedImage) {
        const databaseDeletedImage = await ImageModel.deleteOne({
          publicID: publicID,
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
        const err = new Error();
        err.message = `Can't delete image from Cloudinary. Error: ${cloudinaryDeletedImage}`;
        err.name = "Cloudinary Error";
        throw err;
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
