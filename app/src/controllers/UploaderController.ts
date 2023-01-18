import { Request, Response } from "express";
import * as fs from "fs";

import { ImageModel } from "../models/ImageModel.js";
import jsonResponse from "../helpers/treatingResponses.js";
import { LocalUploader } from "../models/LocalUploader.js";
import { saveImageToDatabase } from "../helpers/databaseOperations.js";
import { error, multerErrors } from "../helpers/treatingErrors.js";
import { CloudUploader } from "../models/CloudUploader.js";

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
          const { subtitle } = req.body;
          if (subtitle === undefined) {
            throw new Error("Subtitle not found.");
          }
          if (req.file) {
            // image succesfully saved to local temp folder
            // getting the path of the saved image in temp folder
            const locallySavedImage = req.file.path;
            // uploading image to Cloudinary service.
            const uploadedImage = await cloudUploader.uploader.upload(locallySavedImage, {
              transformation: [{ quality: 30 }],
              folder: "images",
            });
            if (!uploadedImage) {
              throw new Error(uploadedImage);
            } else {
              const databaseSavedImage = await saveImageToDatabase(
                uploadedImage,
                subtitle
              );
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
                    {
                      imageLink: databaseSavedImage.link!,
                      subtitle: subtitle,
                    }
                  );
                });
              }
            }
          } else {
            throw new Error("Invalid image format.");
          }
        } catch (error: any) {
          jsonResponse(res, 403, "Upload Error!", error.message);
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
          const { id, subtitle } = req.body;
          if (id) {
            const image = await ImageModel.findById(id);
            if (image) {
              if (req.file) {
                const updatedImage = req.file.path;
                const cloudinaryUpload = await cloudUploader.uploader.upload(
                  updatedImage,
                  {
                    public_id: image.publicID,
                    invalidate: true,
                    transformation: [{ quality: 30 }],
                  }
                );
                if (!cloudinaryUpload) {
                  // everything went fine on updating image to Cloudinary
                  throw new Error(cloudinaryUpload);
                }
                fs.unlink(updatedImage, (err) => {
                  if (err) throw err;
                });
              }
              if (subtitle) {
                image.updateOne({ subtitle: subtitle }).catch((err) => {
                  throw new Error(err);
                });
              }
              jsonResponse(res, 201, "Success on updating image to service.");
            } else {
              throw new Error("Image not found");
            }
          } else {
            throw new Error("Invalid uri.");
          }
        } catch (error: any) {
          jsonResponse(res, 400, "Failed to update image.", error.message);
        }
      }
    });
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
          const cloudinaryDeletedImage = await cloudUploader.uploader.destroy(
            imagePublicID!
          );

          if (cloudinaryDeletedImage) {
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
