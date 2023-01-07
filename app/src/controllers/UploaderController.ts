import { Request, Response } from "express";
import { storage, cloudinary } from "../helpers/uploadSettings.js";
import multer = require("multer");

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
                            res.json({
                                status: "Success to upload image to Cloudinary.",
                                file: cloudinaryUpload.secure_url,
                            }).status(201);
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
