import { Request, Response } from "express";
import * as bcrypt from "bcrypt";

import jsonResponse from "../helpers/treatingResponses.js";
import { UserModel } from "../models/UserModel.js";
import { updateAndSaveImage, updateFields } from "../helpers/updateFields.js";
import { Controller } from "./Controller.js";
import { error } from "../helpers/treatingErrors.js";
import { generateToken } from "../helpers/generateToken.js";
import { ICustomRequest, ITokenReturn } from "../models/interfaces/ICustomRequest.js";
import { userReturn } from "../helpers/userReturn.js";

class UserController {
  private controller: Controller;
  private saltRound: number;
  private defaultProfilePic: string;
  private defaultProfilePublicID: string;

  constructor(controller: Controller, salt: number) {
    this.controller = controller;
    this.saltRound = salt;
    this.defaultProfilePic =
      "https://res.cloudinary.com/dpuvdfcf9/image/upload/v1674653316/userPictures/0596bdb89b60fe771acd2f5972a9d3e3_xh9jze.jpg";
    this.defaultProfilePublicID = "userPictures/0596bdb89b60fe771acd2f5972a9d3e3_xh9jze";
  }

  public async register(req: Request, res: Response): Promise<void> {
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
            profilePicture: {
              image: this.defaultProfilePic,
              publicID: this.defaultProfilePublicID,
            },
          }).save();

          if (typeof user === typeof Error || user === undefined) {
            throw new Error(user.toString());
          } else {
            // user successfully saved in database
            const token = generateToken(user);
            if (!token) {
              throw new Error("Failed token.");
            }
            jsonResponse(res, 200, "User successfully saved.", userReturn(user, token));
          }
        }
      }
    } catch (error: any) {
      jsonResponse(res, 400, error.message);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const foundUser = await UserModel.findOne({
        email: email,
      }).select("email password username");
      if (!foundUser) {
        throw new Error("Email not found.");
      }
      const isMatch = bcrypt.compareSync(password, foundUser.password);
      if (isMatch) {
        const userID = foundUser.id;
        const email = foundUser.email;
        const token = generateToken(foundUser);
        if (!token) {
          throw new Error("Failed token.");
        }
        jsonResponse(res, 200, "Sucessfully logged.", {
          user: {
            userID,
            email,
          },
          token: token,
        });
      } else {
        throw new Error("Incorrect passowrd.");
      }
    } catch (error: any) {
      jsonResponse(res, 404, "Not possible to login", error.message);
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
        await this.controller.localUploader.startUpload(req, res, "image");
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
          const changedFields = updateFields(fields, foundUser);
          if (profilePicture !== undefined) {
            // uploading and updating to Cloudinary
            const updatedImage = await updateAndSaveImage(
              profilePicture,
              this.controller.cloudUploader,
              "userPictures"
            );
            // delete previous saved image if it is not the default image
            if (foundUser.profilePicture.image !== this.defaultProfilePic) {
              this.controller.cloudUploader.destroyer(foundUser.profilePicture.publicID);
            }
            // updating on database
            const newProfilePic = await foundUser.updateOne({
              profilePicture: updatedImage.secure_url,
            });
            if (!newProfilePic) {
              throw new Error("Not possible to update image.");
            }
            jsonResponse(res, 200, "User sucessfully updated.", {
              user: {
                _id: id,
                user: foundUser.username,
                email: foundUser.email,
                profilePicture: updatedImage.secure_url,
              },
              changedFields: changedFields,
            });
          }
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
      jsonResponse(res, statusCode, "Failed to return users", error);
    }
  }

  public async getLoggedUser(req: Request, res: Response) {
    try {
      const token = (req as ICustomRequest).token as ITokenReturn;
      const foundUser = await UserModel.findById(token._id);
      if (!foundUser) {
        throw new Error("User not found.");
      }
      jsonResponse(res, 200, "User successfully returned", userReturn(foundUser, token));
    } catch (error: any) {
      jsonResponse(res, 400, "Not able to return user", error);
    }
  }
}

export { UserController };
