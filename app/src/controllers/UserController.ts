import { Request, Response, json } from "express";
import * as bcrypt from "bcrypt";
import jsonResponse from "../helpers/treatingResponses";
import { UserModel } from "../models/UserModel";

const saltRound = 10;
const profilePicture =
  "https://res.cloudinary.com/dpuvdfcf9/image/upload/v1674144178/userPictures/0596bdb89b60fe771acd2f5972a9d3e3_isnvff.jpg";

class UserController {
  public static async createUser(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, saltRound);
      // an error occured trying to generate salt or creating hash
      if (typeof hashedPassword === typeof Error || hashedPassword === undefined) {
        throw new Error(hashedPassword);
      } else {
        // store hash in password DB.
        const alreadyUsedEmail = await UserModel.findOne({
          email: email,
        });
        if (alreadyUsedEmail) {
          throw new Error("Email already exists.");
        } else {
          const user = await new UserModel({
            username: username,
            email: email,
            password: hashedPassword,
            profilePicture: profilePicture,
          }).save();

          if (typeof user === typeof Error || user === undefined) {
            throw new Error(user.toString());
          } else {
            // user successfully saved in database
            jsonResponse(res, 200, "User successfully saved.", {
              id: user._id,
              username: user.username,
              email: user.email,
            });
          }
        }
      }
    } catch (error: any) {
      jsonResponse(res, 400, error.message);
    }
  }

  public static async listAll(_: Request, res: Response) {
    try {
      const users = await UserModel.find({});
      if (typeof users === typeof Error || users === undefined) {
        throw new Error(users.toString());
      } else {
        jsonResponse(res, 200, "Users sucessfully returned", users);
      }
    } catch (error) {
      jsonResponse(res, 400, "Failed to return users", error!);
    }
  }

  public static async editUser(req: Request, res: Response) {
    try {
      // TODO: testar upload de imagem
      const { id, username, email, bio, phone } = req.body;
      const fields = [
        { username: username },
        { email: email },
        { bio: bio },
        { phone: phone },
      ];
      const alreadyUsedEmail = await UserModel.findOne({
        email: email,
      });
      if (alreadyUsedEmail) {
        throw new Error("Email already exists.");
      } else {
        const foundUser = await UserModel.findById(id);
        if (foundUser) {
          let changedFields: Array<Object> = [];
          fields.forEach((field) => {
            if (Object.values(field)[0] != undefined) {
              const key = Object.keys(field)[0];
              const value = Object.values(field)[0];
              changedFields.push({
                [key]: value,
              });
            }
          });
          const updatedFields = await foundUser.updateOne(changedFields[0]);
          if (updatedFields) {
            jsonResponse(res, 201, "User successfully updated.");
          } else {
            throw new Error("Can't update fields");
          }
        } else {
          throw new Error("User not found.");
        }
      }
    } catch (error: any) {
      jsonResponse(res, 400, error.message);
    }
  }

  public static async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error("Not found id.");
      } else {
        const deletedUser = await UserModel.findById(id).deleteOne();
        if (deletedUser === undefined || typeof deletedUser === typeof Error) {
          throw new Error("It was not possible to delete user. Returned: " + deletedUser);
        } else {
          jsonResponse(res, 200, "User Sucessfully Deleted.");
        }
      }
    } catch (error: any) {
      jsonResponse(res, 200, error);
    }
  }
}

export { UserController };
