import { Router } from "express";
import * as swaggerUi from "swagger-ui-express";

const helperRoutes = Router();
//FIXME isso aqui nao deveria ficar no arquivo do app ?
helperRoutes.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);
export { helperRoutes };
