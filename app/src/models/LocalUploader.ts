import { promisify } from "util";
import * as multer from "multer";
import { StorageEngine } from "multer";
import { RequestHandler, Request, Response } from "express";
import * as path from "path";
import * as fs from "fs";

import { ILocalImage } from "./ILocalImage.js";

class LocalUploader {
  protected storage: StorageEngine;

  constructor() {
    this.storage = this.setupStorage();
  }

  public async startUpload(req: Request, res: Response): Promise<ILocalImage> {
    // getting the function that handles local saving
    const handler: RequestHandler = multer({ storage: this.storage }).single("image");
    const uploader = promisify(handler);
    // waiting for uploader to complete the request
    await uploader(req, res);
    /* the req.body have to be used here when the previous uploader
    function changes the value of the object */
    let { subtitle, id } = req.body;
    // with uploader function sucess, req.file has be changed.
    const locallySavedImage: string | undefined = req.file?.path;
    if (!subtitle) {
      subtitle = "";
    }
    const savedImage = {
      res: res,
      id: id,
      locallySavedImage: locallySavedImage,
      subtitle: subtitle,
    };
    return savedImage;
  }

  private setupStorage(): StorageEngine {
    // setting up the destination and filename where the image will be saved on local files
    const storage: StorageEngine = multer.diskStorage({
      destination: function (_, __, cb) {
        const filesFolder = path.join(process.cwd(), "temp/");
        // creating directory if not exists on destination
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
