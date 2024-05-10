import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
      const accToken = req.cookies?.access_Token || req.header("Authorization")?.replace("Bearer ", "");
       
      if (!accToken) {
          throw new Error(400,"Access token not provided");
      }
      
      const decodedToken = jwt.verify(accToken, process.env.ACCESS_TOKEN_SECRET);
      
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      
      if (!user) {
          throw new Error("Invalid access token");
      }
      
      req.user = user;
      next();
  } catch (error) {
       throw new ApiError(400,"invalid token request")
  }
})
