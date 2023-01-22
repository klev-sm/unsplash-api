import mongoose from "mongoose";
import { UserSchema } from "./UserSchema";
mongoose.set("strictQuery", false);
const UserModel = mongoose.model("user", UserSchema);

export { UserModel };
