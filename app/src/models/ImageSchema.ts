import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  link: String,
  publicID: String,
});

export { ImageSchema };
