import { Router } from "express";

import UploadController from "../controllers/UploaderController.js";
import { multerUpload } from "../helpers/multerUploader.js";

const uploaderRoutes = Router();
// routes
uploaderRoutes.post(
    "/saveimage",
    multerUpload.single("image"),
    UploadController.saveImage
);

export { uploaderRoutes };
