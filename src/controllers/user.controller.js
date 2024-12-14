import { asyncHandler } from "../utils/asyncHandler.js";
import {APiError} from "../utils/APiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if userr already exits : username or email
  // check for images, check for avatar
  // upload them to cloudinary, avatar check
  // create user object - create entry in db
  // remove password and refresh token from response
  // check for user creation
  // return res

  const {fullName, email, username, password}  = req.body
  console.log("email: ", email);

  // if(fullName === ""){
  //   throw new APiError(400, "Fullname is required")
  // }

  if(
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APiError(400, "All Field are required")
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }]
  })

  if(existedUser){
    throw new APiError(409, "User with email or username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath) {
    throw new APiError(400, "avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar) {
    throw new APiError(400, "avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverInamge: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser) {
    throw new APiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )

})

export { registerUser, }