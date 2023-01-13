import { Router } from "express";

import { UploaderController } from "../controllers/UploaderController.js";

const uploaderRoutes = Router();
const uploaderController = new UploaderController();
// routes
uploaderRoutes
  .post("/images", uploaderController.saveImage)
  .get("/images", uploaderController.getImages)
  .patch("/images", uploaderController.editImage)
  .delete("/images/:publicID", uploaderController.deleteImage);
export { uploaderRoutes };
