import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    link: String,
});

mongoose.set("strictQuery", false);
const ImageModel = mongoose.model("images", ImageSchema);
export { ImageModel };
