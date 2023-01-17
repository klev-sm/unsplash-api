import { Request, Response } from "express";
import * as fs from "fs";

import { ImageModel } from "../models/ImageModel.js";
import jsonResponse from "../helpers/treatingResponses.js";
import { LocalUploader } from "../models/LocalUploader.js";
import { saveImageToDatabase } from "../helpers/saveImageToDatabase.js";
import { error, multerErrors } from "../helpers/treatingErrors.js";
import { CloudUploader } from "../models/CloudUploader.js";

// FIXME esse código aqui não funciona dentro de um construtor,
// por isso colquei fora!!!
const { localUploader } = new LocalUploader();
const { cloudUploader } = new CloudUploader();

// Routes Class
export class UploaderController {
  public static saveImage(req: Request, res: Response): void {
    // saving image to local temp folder
    localUploader(req, res, async (err) => {
      // treating multer errors on saving file
      const errorMessage: string = multerErrors(err);
      if (errorMessage) {
        // there are errors trying to saving locally
        jsonResponse(res, 500, "Multer Error", `${errorMessage}: ${err}`);
      } else {
        try {
          if (req.file) {
            // image succesfully saved to local temp folder
            // getting the path of the saved image in temp folder
            const locallySavedImage = req.file.path;
            // uploading image to Cloudinary service.
            const uploadedImage = await cloudUploader.uploader.upload(locallySavedImage, {
              transformation: [{ quality: 30 }],
            });
            if (!uploadedImage) {
              throw new Error(uploadedImage);
            } else {
              const databaseSavedImage = await saveImageToDatabase(uploadedImage);
              if (!databaseSavedImage) {
                throw new Error(databaseSavedImage);
              } else {
                // everything went fine!
                // deleting image from temp folder and returning response
                fs.unlink(locallySavedImage, (err) => {
                  if (err) throw err;
                  jsonResponse(
                    res,
                    201,
                    "Success on uploading image to Cloudinary and saving it to database",
                    databaseSavedImage.link!
                  );
                });
              }
            }
          } else {
            throw new Error("Invalid image format.");
          }
        } catch (error: any) {
          jsonResponse(res, 403, "Cloudinary Error", error.message);
        }
      }
    });
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

  public static editImage(req: Request, res: Response) {
    localUploader(req, res, async (err) => {
      const errorMessage: string = multerErrors(err);
      if (errorMessage) {
        // there are errors on locally saving
        jsonResponse(res, 500, "Multer Error", `${errorMessage}: ${err}`);
      } else {
        try {
          const publicID: string = req.body.publicID;
          if (publicID) {
            if (req.file) {
              const updatedImage = req.file.path;
              const cloudinaryUpload = await cloudUploader.uploader.upload(updatedImage, {
                public_id: publicID,
                invalidate: true,
              });
              if (!cloudinaryUpload) {
                // everything went fine on updating image to Cloudinary
                throw new Error(cloudinaryUpload);
              }
              // everything went fine!
              // deleting image from temp folder and returning response
              fs.unlink(updatedImage, (err) => {
                if (err) throw err;
                jsonResponse(res, 201, "Success on updating image to service");
              });
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

  public static async deleteImage(req: Request, res: Response) {
    try {
      const publicID: string = req.params.publicID;
      if (publicID === undefined) {
        error("Can't find an undefined public id.", "Not Found.");
      }
      const cloudinaryDeletedImage = await cloudUploader.uploader.destroy(publicID);
      if (cloudinaryDeletedImage) {
        const databaseDeletedImage = await ImageModel.deleteOne({
          publicID: publicID,
        });
        if (databaseDeletedImage) {
          jsonResponse(res, 200, "Success on deleting image to database and Cloudinary.");
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
    } catch (error: any) {
      let statusCode: number = 400;

      if (error.name === "Not Found") {
        statusCode = 404;
      }

      jsonResponse(res, statusCode, "Not able to delete image!", error.message);
    }
  }
}
