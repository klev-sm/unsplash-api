import { Request, Response } from "express";
import * as multer from "multer";
import * as cloudinary from "cloudinary";

const cloudinaryV2 = cloudinary.v2;

export default class UploadController {
    static getHome(req: Request, res: Response): void {
        res.send("Sla");
    }
}
