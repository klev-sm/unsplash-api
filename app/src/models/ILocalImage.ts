import { Response } from "express";

interface ILocalImage {
  res: Response | undefined;
  locallySavedImage: string | undefined;
  subtitle: string | undefined;
  id: string | undefined;
  profilePicture: string | undefined;
  username: string | undefined;
  email: string | undefined;
  bio: string | undefined;
  phone: string | undefined;
  password: string | undefined;
}

export { ILocalImage };
