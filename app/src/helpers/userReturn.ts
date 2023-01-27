import { ICustomRequest, ITokenReturn } from "../models/interfaces/ICustomRequest";
import { IUserDocument } from "../models/interfaces/IUserDocument";

export function userReturn(user: IUserDocument, token?: ITokenReturn | string): object {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture.image || user.profilePicture,
    token: token || "Token visualization is not necessary in this route",
    bio: user?.bio || "",
    phone: user.phone || "",
  };
}
