import { Schema, Types } from "mongoose";

const ImageSchema = new Schema({
  link: String,
  publicID: String,
  subtitle: String,
  user: {
    type: Types.ObjectId,
    ref: "users",
  },
});

export { ImageSchema };
