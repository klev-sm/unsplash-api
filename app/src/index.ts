import * as path from "path";
import * as dotenv from "dotenv";

import App from "./App.js";

const dotEnvPath = path.join(process.cwd(), "/.env");
dotenv.config({ path: dotEnvPath });

const appConnection = new App();
const port: number = appConnection.port;
appConnection.server.listen(port, () => {
    console.log(`Successfully running server on port ${port}`);
});
