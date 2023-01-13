import * as multer from "multer";
import { StorageEngine } from "multer";
import { RequestHandler } from "express";
import * as path from "path";
import * as fs from "fs";

class LocalUploader {
  public localStorage: StorageEngine;

  constructor() {
    this.localStorage = this.storageSetup();
  }

  public multerSetup(storage: StorageEngine) {
    const multerUploader: RequestHandler = multer({ storage: storage }).single(
      "image"
    );
    return multerUploader;
  }

  // setting up the destination and filename where
  // the image will be saved on local files
  public storageSetup(): StorageEngine {
    const storage = multer.diskStorage({
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
    return storage;
  }
}

export { LocalUploader };
