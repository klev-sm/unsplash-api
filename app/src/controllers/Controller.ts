import { CloudinaryUploader } from "../models/CloudinaryUploader.js";
import { LocalUploader } from "../models/LocalUploader.js";

class Controller {
  public localUploader: LocalUploader;
  public cloudUploader: CloudinaryUploader;

  constructor() {
    this.localUploader = new LocalUploader();
    this.cloudUploader = new CloudinaryUploader();
  }
}

export { Controller };
