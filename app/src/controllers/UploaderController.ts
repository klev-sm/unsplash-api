import { Request, Response } from "express";
import multer = require("multer");

import { storage, cloudinary } from "../helpers/settingsLocalUpload.js";
import { ImageModel } from "../models/ImageModel.js";

const multerUpload = multer({ storage }).single("image");

// Routes Class
export default class UploaderController {
    static saveImage(req: Request, res: Response): void {
        multerUpload(req, res, async function (err) {
            // Treating multer erros
            if (err instanceof multer.MulterError) {
                res.json({
                    status: "Multer Error",
                    message:
                        "A Multer error occurred when saving to local folder.",
                }).status(400);
            } else if (err) {
                res.json({
                    status: "Multer Error",
                    message:
                        "An unknown error occurred when saving to local folder.",
                }).status(400);
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
                                res.json({
                                    status: "Success on uploading image to Cloudinary and saving it to database.",
                                    file: image.link,
                                }).status(201);
                            } else {
                                throw new Error(image);
                            }
                        } else {
                            throw new Error(cloudinaryUpload);
                        }
                    }
                } catch (error) {
                    res.json({
                        status: "Cloudinary Error",
                        message: error,
                    }).status(400);
                }
            }
        });
    }

    static async getImages(req: Request, res: Response): Promise<void> {
        try {
            const images = await ImageModel.find({});
            if (images) {
                res.json({
                    status: "Success on returning images from database.",
                    images: images,
                }).status(200);
            } else {
                throw new Error(images);
            }
        } catch (error) {
            res.json({
                status: "Failed to return images",
                message: error,
            }).status(404);
        }
    }

    static editImage(req: Request, res: Response) {
        multerUpload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                res.json({
                    status: "Multer Error",
                    message:
                        "A Multer error occurred when saving to local folder.",
                }).status(400);
            } else if (err) {
                res.json({
                    status: "Multer Error",
                    message:
                        "An unknown error occurred when saving to local folder.",
                }).status(400);
            } else {
                try {
                    const publicID = req.body.publicID;
                    if (req.file) {
                        const updatedImage = req.file.path;
                        const cloudinaryUpload =
                            await cloudinary.uploader.upload(updatedImage, {
                                public_id: publicID,
                            });
                        if (cloudinaryUpload) {
                            // everything went fine on updating image to Cloudinary
                            res.json({
                                status: "Success on updating image to service.",
                            }).status(200);
                        } else {
                            throw new Error(cloudinaryUpload);
                        }
                    }
                } catch (error) {
                    res.json({
                        status: "Failed to update image.",
                        message: error,
                    }).status(400);
                }
            }
        });
    }

    static async deleteImage(req: Request, res: Response) {
        // preciso pegar o publicID da imagem na Cloudinary [x]
        // deletar da Cloudinary [x]
        // deletar do banco de dados
        try {
            const publicID: string = req.body.publicID;
            if (publicID === undefined) {
                throw new Error("Can't find an undefined public id.");
            }
            const cloudinaryDeletedImage = await cloudinary.uploader.destroy(
                publicID
            );
            console.log("cloudinary: " + cloudinaryDeletedImage);
            if (cloudinaryDeletedImage) {
                const databaseDeletedImage = await ImageModel.deleteOne({
                    publicID: publicID,
                });
                if (databaseDeletedImage) {
                    res.json({
                        status: "Success on deleting image to database and Cloudinary.",
                    }).status(200);
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
            res.status(400).json({
                status: "Not able to delete image!",
                message: error.message,
            });
        }
    }
}
