import { Schema, Types } from "mongoose";

const ImageSchema = new Schema({
  link: String,
  publicId: String,
  subtitle: String,
  userId: {
    type: Types.ObjectId,
    ref: "users",
  },
});

export { ImageSchema };
