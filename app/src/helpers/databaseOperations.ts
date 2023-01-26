import { UploadApiResponse } from "cloudinary";
import { ImageModel } from "../models/ImageModel";
import { Types } from "mongoose";

type ModelImage = {
  uploadedImage?: UploadApiResponse;
  subtitle?: string;
  userId?: {
    type: Types.ObjectId;
    ref: "users";
  };
};

type SchemaImage = {
  link?: string;
  publicId?: string;
  subtitle?: string;
  userId?: {
    type: Types.ObjectId;
    ref: "users";
  };
};

async function saveImageToDatabase(options: ModelImage) {
  const sanitizedImages: SchemaImage = {};

  if (options.uploadedImage !== undefined) {
    sanitizedImages.link = options.uploadedImage.secure_url;
    sanitizedImages.publicId = options.uploadedImage.public_id;
  }
  if (options.subtitle !== undefined) {
    sanitizedImages.subtitle = options.subtitle;
  }
  sanitizedImages.userId = options.userId;
  const databaseSavedImage = await new ImageModel(sanitizedImages).save();
  return databaseSavedImage;
}

export { saveImageToDatabase };
