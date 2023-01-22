import { Request, Response, json } from "express";
import * as fs from "fs";

import { ImageModel } from "../models/ImageModel.js";
import jsonResponse from "../helpers/treatingResponses.js";
import { LocalUploader } from "../models/LocalUploader.js";
import { CloudUploader } from "../models/CloudUploader.js";
import { saveImageToDatabase } from "../helpers/databaseOperations.js";
import { UploadApiResponse } from "cloudinary";
import { deleteTempImage } from "../helpers/deleteTempImage.js";

const localUploader = new LocalUploader();
const cloudUploader = new CloudUploader();

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
          const databaseSavedImage = await saveImageToDatabase(uploadedImage, subtitle);
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
      const { id } = req.body;
      if (!id) {
        throw new Error("Image id not found.");
      } else {
        const foundImage = await ImageModel.findById(id);
        if (!foundImage) {
          throw new Error("Not found image from the given id.");
        } else {
          const { locallySavedImage, subtitle } = await localUploader.startUpload(
            req,
            res
          );
          if (locallySavedImage !== undefined && subtitle !== undefined) {
            const fields = [{ subtitle: subtitle }];
            let changedFields: Array<Object> = [];
            fields.forEach(async (field) => {
              if (Object.values(field)[0] != undefined) {
                const key = Object.keys(field)[0];
                const value = Object.values(field)[0];
                changedFields.push({
                  [key]: value,
                });
              }
              // uploading image to cloud service
              const uploadedImage: UploadApiResponse = await cloudUploader.uploader(
                locallySavedImage,
                {
                  public_id: foundImage.publicID,
                  invalidate: true,
                  transformation: [{ quality: 30 }],
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
                const databaseSavedImage = await saveImageToDatabase();
                const updateFields = await foundImage.updateOne(changedFields[0]);
                if (!databaseSavedImage) {
                  throw new Error(databaseSavedImage);
                } else {
                  if (updateFields) {
                    // everything went fine!
                    jsonResponse(res, 201, "Image successfully updated.", {
                      id: databaseSavedImage._id,
                      imageLink: databaseSavedImage.link!,
                      subtitle: subtitle,
                    });
                  } else {
                    throw new Error("Can't update fields");
                  }
                }
              }
            });
          }
        }
      }
    } catch (error: any) {
      jsonResponse(res, 400, "Failed to update image.", error.toString());
    }
    // // saving image to local temp folder

    //     try {
    //       const {id} = req.body;
    //       if (id) {
    //         const image = await ImageModel.findById(id);
    //         if (image) {
    //           if (req.file) {
    //             const updatedImage = req.file.path;
    //             const cloudinaryUpload = await cloudUploader.uploader.upload(
    //               updatedImage,
    //               {
    //                 public_id: image.publicID,
    //                 invalidate: true,
    //                 transformation: [{ quality: 30 }],
    //               }
    //             );
    //             if (!cloudinaryUpload) {
    //               // everything went fine on updating image to Cloudinary
    //               throw new Error(cloudinaryUpload);
    //             }
    //             fs.unlink(updatedImage, (err) => {
    //               if (err) throw err;
    //             });
    //           }
    //           if (subtitle) {
    //             image.updateOne({ subtitle: subtitle }).catch((err) => {
    //               throw new Error(err);
    //             });
    //           }
    //           jsonResponse(res, 201, "Success on updating image to service.");
    //         } else {
    //           throw new Error("Image not found");
    //         }
    //       } else {
    //         throw new Error("Invalid uri.");
    //       }
    //     } catch (error: any) {
    //       jsonResponse(res, 400, "Failed to update image.", error.message);
    //     }
    //   }
    // });
  }

  // public static async deleteImage(req: Request, res: Response) {
  //   try {
  //     const id: string = req.params.id;
  //     if (id === undefined) {
  //       error("Can't find an undefined id.", "Not Found.");
  //     } else {
  //       const image = await ImageModel.findById(id);
  //       if (image) {
  //         const imagePublicID = image.publicID;
  //         const cloudinaryDeletedImage = await cloudUploader.uploader.destroy(
  //           imagePublicID!
  //         );

  //         if (cloudinaryDeletedImage) {
  //           const databaseDeletedImage = await ImageModel.deleteOne({
  //             publicID: imagePublicID,
  //           });
  //           if (databaseDeletedImage) {
  //             jsonResponse(
  //               res,
  //               200,
  //               "Success on deleting image to database and Cloudinary."
  //             );
  //           } else {
  //             throw new Error(
  //               "Can't delete image from database. Error: " + databaseDeletedImage
  //             );
  //           }
  //         } else {
  //           error(
  //             `Can't delete image from Cloudinary. Error: ${cloudinaryDeletedImage}`,
  //             "Cloudinary Error"
  //           );
  //         }
  //       } else {
  //         error("Image does not exists.", "Not Found");
  //       }
  //     }
  //   } catch (error: any) {
  //     let statusCode: number = 400;

  //     if (error.name === "Not Found") {
  //       statusCode = 404;
  //     }

  //     jsonResponse(res, statusCode, "Not able to delete image!", error.message);
  //   }
  // }
}
