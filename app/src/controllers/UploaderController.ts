import { Request, Response } from "express";
import multer = require("multer");

import { storage, cloudinary } from "../helpers/settingsLocalUpload.js";
import { ImageModel } from "../models/ImageModel.js";

const multerUpload = multer({ storage }).single("image");

// Routes Class
export default class UploaderController {
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
}
