import * as multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import * as path from "path";
import * as fs from "fs";

// Cloudinary settings
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

console.log("Path: " + path.join(process.cwd(), "temp/"));

const multerUpload = multer({ storage });
export { multerUpload };
