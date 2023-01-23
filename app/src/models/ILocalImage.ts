import { Response } from "express";

interface ILocalImage {
  res: Response | undefined;
  locallySavedImage: string | undefined;
  subtitle: string | undefined;
  id: string | undefined;
}

export { ILocalImage };
