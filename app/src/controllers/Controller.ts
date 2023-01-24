import { CloudinaryUploader } from "../models/CloudinaryUploader";
import { LocalUploader } from "../models/services/LocalUploader";

class Controller {
  public localUploader: LocalUploader;
  public cloudUploader: CloudinaryUploader;

  constructor() {
    this.localUploader = new LocalUploader();
    this.cloudUploader = new CloudinaryUploader();
  }
}

export { Controller };
