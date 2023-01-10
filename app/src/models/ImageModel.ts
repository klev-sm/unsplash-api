import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    link: String,
    publicID: String,
});

mongoose.set("strictQuery", false);
const ImageModel = mongoose.model("images", ImageSchema);
export { ImageModel };
