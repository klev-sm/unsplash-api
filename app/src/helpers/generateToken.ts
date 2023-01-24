import * as jwt from "jsonwebtoken";
import { IUserDocument } from "../models/interfaces/IUserDocument";

export function generateToken(user: IUserDocument) {
  const token = jwt.sign(
    {
      _id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY as string,
    {
      expiresIn: "2 days",
      algorithm: "HS256",
    }
  );
  return token;
}
