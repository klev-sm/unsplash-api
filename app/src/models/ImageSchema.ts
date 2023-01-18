import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  link: String,
  publicID: String,
  subtitle: String,
});

export { ImageSchema };
