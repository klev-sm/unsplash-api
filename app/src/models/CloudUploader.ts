import { ConfigOptions, v2 as cloudinary } from "cloudinary";

class CloudUploader {
  public cloudUploader;

  constructor() {
    this.cloudUploader = this.setup();
  }

  private setup() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cloudinary;
  }
}

export { CloudUploader };
