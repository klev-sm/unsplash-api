import mongoose from "mongoose";
import { ImageSchema } from "./schemas/ImageSchema";

mongoose.set("strictQuery", false);
const ImageModel = mongoose.model("images", ImageSchema);

export { ImageModel };
