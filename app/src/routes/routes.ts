import { Router } from "express";

import { UserController } from "../controllers/UserController.js";
import { Controller } from "../controllers/Controller.js";
import { UploaderController } from "../controllers/UploaderController.js";
import { auth } from "../middlewares/auth.js";

const userRoutes = Router();
const uploaderRoutes = Router();

const controller = new Controller();
const uploaderController = new UploaderController(controller);
const userController = new UserController(controller, 10);

uploaderRoutes
  .post("/images", auth, uploaderController.saveImage.bind(uploaderController))
  .get("/images", uploaderController.getImages.bind(uploaderController))
  .patch("/images", auth, uploaderController.editImage.bind(uploaderController))
  .delete("/images/:id", auth, uploaderController.deleteImage.bind(uploaderController));

userRoutes
  .post("/user", userController.register.bind(userController))
  .post("/user/login", userController.login.bind(userController))
  .get("/user", userController.listAll.bind(userController))
  .get("/user/byToken", auth, userController.getLoggedUser.bind(userController))
  .put("/user", auth, userController.editUser.bind(userController))
  .delete("/user/:id", auth, userController.deleteUser.bind(userController));

export { userRoutes, uploaderRoutes };
