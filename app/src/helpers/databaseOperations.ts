import { UploadApiResponse } from "cloudinary";
import { ImageModel } from "../models/ImageModel";
import { Types } from "mongoose";

type ModelImage = {
  uploadedImage?: UploadApiResponse;
  subtitle?: string;
};

type ImageByUser = {
  userId: {
    type: Types.ObjectId;
    ref: "users";
  };
};

type Sanitizer = {
  link?: string;
  publicID?: string;
  subtitle?: string;
};

async function saveImageToDatabase(options: ModelImage) {
  const sanitizedImages: Sanitizer = {};

  if (options.uploadedImage !== undefined) {
    sanitizedImages.link = options.uploadedImage.secure_url;
    sanitizedImages.publicID = options.uploadedImage.public_id;
  }
  if (options.subtitle !== undefined) {
    sanitizedImages.subtitle = options.subtitle;
  }

  const databaseSavedImage = await new ImageModel(sanitizedImages).save();
  return databaseSavedImage;
}

export { saveImageToDatabase };
