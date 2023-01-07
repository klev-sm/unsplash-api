import { Router } from "express";

import UploadController from "../controllers/UploaderController.js";

const uploaderRoutes = Router();
// routes
uploaderRoutes.post("/saveimage", UploadController.saveImage);

export { uploaderRoutes };
