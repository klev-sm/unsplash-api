import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

export interface ITokenReturn {
  _id: string;
  email: string;
  username: string;
}

export interface ICustomRequest extends Request {
  token: ITokenReturn | string | JwtPayload;
}
