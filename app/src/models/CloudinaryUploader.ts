import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from "cloudinary";

class CloudinaryUploader {
  constructor() {
    this.setup();
  }

  public async uploader(
    locallySavedImage: string,
    options?: UploadApiOptions | undefined
  ): Promise<UploadApiResponse> {
    // uploading image to Cloudinary service.
    const uploadedImage: UploadApiResponse = await cloudinary.uploader.upload(
      locallySavedImage,
      options
    );
    return uploadedImage;
  }

  public async destroyer(publicID: string): Promise<any> {
    const deletedImage = await cloudinary.uploader.destroy(publicID);
    return deletedImage;
  }

  private setup() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

export { CloudinaryUploader };
