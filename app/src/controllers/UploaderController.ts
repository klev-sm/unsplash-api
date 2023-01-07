import { Request, Response } from "express";

// Routes Class
export default class UploadController {
    // Multer settings
    static saveImage(req: Request, res: Response): void {
        console.log(req.file);
    }
}
