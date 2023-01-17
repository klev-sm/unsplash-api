import * as express from "express";
import { Application } from "express";
import * as cors from "cors";
import * as swaggerUi from "swagger-ui-express";

import { uploaderRoutes } from "./routes/uploaderRoutes.js";

export default class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.useMiddlewares();
    this.getRoutes();
  }

  // -- Methods to starts with constructor --
  private useMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static("public"));
    this.app.use(cors());
  }

  private getRoutes() {
    this.app.use(uploaderRoutes);
    this.app.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: "/swagger.json",
        },
      })
    );
  }
}
