import { Request, Response, json } from "express";
import multer = require("multer");

import { storage, cloudinary } from "../helpers/settingsLocalUpload.js";
import { ImageModel } from "../models/ImageModel.js";
import jsonResponse from "../helpers/jsonResponse.js";

const multerUpload = multer({ storage }).single("image");

// Routes Class
export default class UploaderController {
    static saveImage(req: Request, res: Response): void {
        multerUpload(req, res, async function (err) {
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
                        const cloudinaryUpload =
                            await cloudinary.uploader.upload(savedImage);
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

    static async getImages(_: Request, res: Response): Promise<void> {
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

    static editImage(req: Request, res: Response) {
        multerUpload(req, res, async function (err) {
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
                            const cloudinaryUpload =
                                await cloudinary.uploader.upload(updatedImage, {
                                    public_id: publicID,
                                    invalidate: true,
                                });
                            if (cloudinaryUpload) {
                                // everything went fine on updating image to Cloudinary
                                jsonResponse(
                                    res,
                                    201,
                                    "Success on updating image to service"
                                );
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

    static async deleteImage(req: Request, res: Response) {
        try {
            const publicID: string = req.body.publicID;
            if (publicID === undefined) {
                throw new Error("Can't find an undefined public id.");
            }
            const cloudinaryDeletedImage = await cloudinary.uploader.destroy(
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
                        "Can't delete image from database. Error: " +
                            databaseDeletedImage
                    );
                }
            } else {
                throw new Error(
                    "Can't delete image from Cloudinary. Error: " +
                        cloudinaryDeletedImage
                );
            }
        } catch (error: any) {
            jsonResponse(res, 400, "Not able to delete image!", error.message);
        }
    }
}
