import { Router } from "express";

import UploadController from "../controllers/UploaderController.js";

const uploaderRoutes = Router();
// routes
uploaderRoutes
    .post("/images", UploadController.saveImage)
    .get("/images", UploadController.getImages)
    .patch("/images", UploadController.editImage)
    .delete("/images/:publicID", UploadController.deleteImage);
export { uploaderRoutes };
