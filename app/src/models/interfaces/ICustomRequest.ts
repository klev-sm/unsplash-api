import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

export interface ICustomRequest extends Request {
  token: string | JwtPayload;
}
