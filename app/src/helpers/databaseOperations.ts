import { UploadApiResponse } from "cloudinary";
import { ImageModel } from "../models/ImageModel";

async function saveImageToDatabase(uploadedImage?: UploadApiResponse, subtitle?: string) {
  const options = [uploadedImage, subtitle];
  const notEmptyObject = options.map(() => {});

  console.log(notEmptyObject);
  const databaseSavedImage = await new ImageModel({
    link: uploadedImage.secure_url,
    publicID: uploadedImage.public_id,
    subtitle: subtitle,
  }).save();
  return databaseSavedImage;
}

export { saveImageToDatabase };
