import * as multer from "multer";
import { StorageEngine } from "multer";
import { RequestHandler } from "express";
import * as path from "path";
import * as fs from "fs";

class LocalUploader {
  public localUploader: RequestHandler;

  constructor() {
    this.localUploader = this.setup();
  }

  private setup(): RequestHandler {
    // setting up the destination and filename where
    // the image will be saved on local files
    const storage: StorageEngine = multer.diskStorage({
      destination: function (_, __, cb) {
        const filesFolder = path.join(process.cwd(), "temp/");
        fs.mkdirSync(filesFolder, { recursive: true });
        cb(null, filesFolder);
      },
      filename: function (_, file, cb) {
        // getting file extension from upload
        const fileExtension = path.extname(file.originalname);
        // creating file name to save on temp folder
        cb(null, Date.now() + fileExtension);
      },
    });
    const multerUploader = multer({ storage: storage }).single("image");
    return multerUploader;
  }
}

export { LocalUploader };
