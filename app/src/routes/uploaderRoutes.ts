import { Router } from "express";

import { UploaderController } from "../controllers/UploaderController.js";

const uploaderRoutes = Router();

// routes
uploaderRoutes
  .post("/images", UploaderController.saveImage)
  .get("/images", UploaderController.getImages)
  .patch("/images", UploaderController.editImage)
  .delete("/images/:publicID", UploaderController.deleteImage);
export { uploaderRoutes };
