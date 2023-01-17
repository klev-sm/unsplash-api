import mongoose from "mongoose";
import { ImageSchema } from "./ImageSchema";
mongoose.set("strictQuery", false); // FIXME Isso aqui é necessario mesmo???
// FIXME RESPOSTA: quando eu tiro essa opção, o mongoose joga um WARNING no console
const ImageModel = mongoose.model("images", ImageSchema);

export { ImageModel };
