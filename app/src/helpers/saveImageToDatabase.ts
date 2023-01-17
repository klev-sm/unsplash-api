import { UploadApiResponse } from "cloudinary";
import { ImageModel } from "../models/ImageModel";

async function saveImageToDatabase(uploadedImage: UploadApiResponse) {
  const databaseSavedImage = await new ImageModel({
    link: uploadedImage.secure_url,
    publicID: uploadedImage.public_id,
  }).save();
  return databaseSavedImage;
}

export { saveImageToDatabase };
