import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

import jsonResponse from "../helpers/treatingResponses.js";
import { ICustomRequest } from "../models/interfaces/ICustomRequest.js";

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const SECRET_KEY: jwt.Secret = process.env.SECRET_KEY as string;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("Invalid or not found token.");
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as ICustomRequest).token = decoded;
    next();
  } catch (error) {
    jsonResponse(res, 401, "Unauthorized", "Please authenticate");
  }
}
