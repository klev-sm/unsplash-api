import { Document } from "mongoose";

import { ImageSchema } from "../schemas/ImageSchema";

export interface IUserDocument extends Document {
  username: string;
  email: string;
  password: string;
  bio: string;
  phone: string;
  profilePicture: {
    image: string;
    publicID: string;
  };
  images: typeof ImageSchema;
}
