import { Router } from "express";

import { UserController } from "../controllers/UserController.js";
import { Controller } from "../controllers/Controller.js";
import { UploaderController } from "../controllers/UploaderController.js";

const userRoutes = Router();
const uploaderRoutes = Router();

const controller = new Controller();
const uploaderController = new UploaderController(controller);
const userController = new UserController(controller, 10);

uploaderRoutes
  .post("/images", uploaderController.saveImage.bind(uploaderController))
  .get("/images", uploaderController.getImages.bind(uploaderController))
  .patch("/images", uploaderController.editImage.bind(uploaderController))
  .delete("/images/:id", uploaderController.deleteImage.bind(uploaderController));

userRoutes
  .post("/user", userController.createUser.bind(userController))
  .get("/user", userController.listAll.bind(userController))
  .put("/user", userController.editUser.bind(userController))
  .delete("/user/:id", userController.deleteUser.bind(userController));

export { userRoutes, uploaderRoutes };
