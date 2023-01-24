import { Document } from "mongoose";

export interface IUserDocument extends Document {
  username: string;
  email: string;
  password: string;
  bio: string;
  phone: string;
  profilePicture: string;
}
