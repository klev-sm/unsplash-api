import { Router } from "express";

const userRoutes = Router();
import { UserController } from "../controllers/UserController.js";

userRoutes
  .post("/user", UserController.createUser)
  .get("/user", UserController.listAll)
  .put("/user", UserController.editUser)
  .delete("/user/:id", UserController.deleteUser);

export { userRoutes };
