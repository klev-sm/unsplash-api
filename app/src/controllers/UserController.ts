import { Request, Response } from "express";
import * as bcrypt from "bcrypt";

import jsonResponse from "../helpers/treatingResponses.js";
import { UserModel } from "../models/UserModel.js";
import { updateFields } from "../helpers/updateFields.js";
import { Controller } from "./Controller.js";
import { error } from "../helpers/treatingErrors.js";

class UserController {
  private controller: Controller;
  private saltRound: number;
  private defaultProfilePic: string;

  constructor(controller: Controller, salt: number) {
    this.controller = controller;
    this.saltRound = salt;
    this.defaultProfilePic =
      "https://res.cloudinary.com/dpuvdfcf9/image/upload/v1674144178/userPictures/0596bdb89b60fe771acd2f5972a9d3e3_isnvff.jpg";
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, this.saltRound);
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
            profilePicture: this.defaultProfilePic,
          }).save();

          if (typeof user === typeof Error || user === undefined) {
            throw new Error(user.toString());
          } else {
            // user successfully saved in database
            jsonResponse(res, 200, "User successfully saved.", {
              id: user._id,
              username: user.username,
              email: user.email,
              profilePicture: user.profilePicture,
            });
          }
        }
      }
    } catch (error: any) {
      jsonResponse(res, 400, error.message);
    }
  }

  public async listAll(_: Request, res: Response) {
    try {
      const users = await UserModel.find({});
      if (typeof users === typeof Error || users === undefined) {
        error("Error!", "Not Found");
      } else {
        jsonResponse(res, 200, "Users sucessfully returned", users);
      }
    } catch (error: any) {
      let statusCode = 400;
      if (error.name === "Not Found") {
        statusCode = 404;
      }
      jsonResponse(res, statusCode, "Failed to return users", error!);
    }
  }

  public async editUser(req: Request, res: Response) {
    try {
      const { id, profilePicture, username, email, bio, phone, password } =
        await this.controller.localUploader.startUpload(req, res, "users");
      const fields = [
        { username: username },
        { email: email },
        { bio: bio },
        { phone: phone },
        { password: password },
      ];
      const alreadyUsedEmail = await UserModel.findOne({
        email: email,
      });
      if (alreadyUsedEmail) {
        throw new Error("Email already exists.");
      } else {
        const foundUser = await UserModel.findById(id);
        if (foundUser) {
          updateFields(fields, foundUser);
          if (profilePicture !== undefined) {
            const newProfilePic = await foundUser.updateOne({
              profilePicture: profilePicture,
            });
            if (!newProfilePic) {
              throw new Error("Not possible to update image.");
            }
          }
          jsonResponse(res, 200, "User sucessfully updated.");
        } else {
          throw new Error("User not found.");
        }
      }
    } catch (error: any) {
      jsonResponse(res, 400, error.message);
    }
  }

  public async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        error("Not possible to find id", "Not Found");
      } else {
        const deletedUser = await UserModel.findById(id).deleteOne();
        if (deletedUser === undefined || typeof deletedUser === typeof Error) {
          throw new Error("It was not possible to delete user. Returned: " + deletedUser);
        } else {
          jsonResponse(res, 200, "User Sucessfully Deleted.");
        }
      }
    } catch (error: any) {
      let statusCode = 400;
      if (error.name === "Not Found") {
        statusCode = 404;
      }
      jsonResponse(res, statusCode, "Failed to return users", error!);
    }
  }
}

export { UserController };
