import * as path from "path";
import * as dotenv from "dotenv";
const dotEnvPath = path.join(process.cwd(), "/.env");
dotenv.config({ path: dotEnvPath });

import mongoose from "mongoose";

import App from "./App.js";

async function main() {
  // connecting to database
  try {
    const mongoConnection = await mongoose.connect(process.env.MONGO_URL!);
    if (!mongoConnection) {
      throw new Error(mongoConnection);
    } else {
      if (mongoConnection.connection.readyState === 1) {
        console.log("Database connection sucessfully estabelished");
      }
    }
  } catch (error) {
    console.log(error);
  }

  // creating an app
  const port: number = Number(process.env.PORT) || 3000;
  const appConnection = new App();
  appConnection.app.listen(port, () => {
    console.log(`Successfully running server on port ${port}`);
  });
}

main();
