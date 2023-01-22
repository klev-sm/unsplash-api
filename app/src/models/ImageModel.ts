import mongoose from "mongoose";
import { ImageSchema } from "./ImageSchema";

mongoose.set("strictQuery", false);
const ImageModel = mongoose.model("images", ImageSchema);

export { ImageModel };
