import { Schema, Types } from "mongoose";

import { IUserDocument } from "../interfaces/IUserDocument";

const UserSchema: Schema<IUserDocument> = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  bio: String,
  phone: String,
  profilePicture: String,
  images: [
    {
      type: Types.ObjectId,
      ref: "images",
    },
  ],
});

export { UserSchema };
