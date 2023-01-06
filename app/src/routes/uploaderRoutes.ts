import { Router } from "express";
import UploadController from "../controllers/UploaderController.js";

const uploaderRoutes = Router();
// routes
uploaderRoutes.get("/", UploadController.getHome);

export { uploaderRoutes };
