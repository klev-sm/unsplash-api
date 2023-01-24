import { UploadApiResponse } from "cloudinary";
import { Document } from "mongoose";
import { CloudinaryUploader } from "../models/CloudinaryUploader";
import { deleteTempImage } from "./deleteTempImage";

function updateFields(fieldsToUpdate: Array<Object>, foundedModel: Document): Object[] {
  // getting all the fields that will be saved on database
  // image link on database does not changes.
  const fields = fieldsToUpdate;
  let changedFields: Array<Object> = [];
  fields.forEach(async (field) => {
    const fieldValue = Object.values(field)[0];
    const fieldKey = Object.keys(field)[0];
    if (fieldValue !== undefined && fieldKey !== "id") {
      const key = fieldKey;
      const value = fieldValue;
      changedFields.push({
        [key]: value,
      });
    }
  });
  // saving changed fields on MongoDB
  changedFields.forEach(async (field) => {
    const updatedField = await foundedModel.updateOne(field);
    if (!updatedField) {
      throw new Error("Not able to update the given field.");
    }
  });

  return changedFields;
}

async function updateImage(
  locallySavedImage: string,
  cloudUploader: CloudinaryUploader,
  publicID: string
) {
  // uploading image to cloud service
  const uploadedImage: UploadApiResponse = await cloudUploader.uploader(
    locallySavedImage,
    {
      public_id: publicID,
      invalidate: true,
      transformation: [{ quality: 30 }],
    }
  );
  // deleting image from temp folder
  const errorOnDelete = deleteTempImage(locallySavedImage);
  if (errorOnDelete) {
    throw new Error(errorOnDelete.message);
  }
  if (!uploadedImage) {
    throw new Error(uploadedImage);
  }
}

export { updateFields, updateImage };
