import { Response } from "express";

export default function jsonResponse(
  res: Response,
  status: number,
  statusMessage: string,
  response?: string | object
) {
  res.status(status).json({
    message: statusMessage,
    response: response,
  });
}
