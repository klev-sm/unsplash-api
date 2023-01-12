import { Router } from "express";
import * as swaggerUi from "swagger-ui-express";

const helperRoutes = Router();
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
