import { ICustomRequest, ITokenReturn } from "../models/interfaces/ICustomRequest";
import { IUserDocument } from "../models/interfaces/IUserDocument";

export function userReturn(user: IUserDocument, token: ITokenReturn | string): object {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture.image,
    token: token,
    bio: user?.bio || "",
    phone: user.phone || "",
  };
}
