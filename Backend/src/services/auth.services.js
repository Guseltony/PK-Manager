// register user

import { prisma } from "../libs/prisma.js";
import bcrypt from "bcryptjs";
import session from "./session.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token.utils.js";

const registerUser = async ({ email, password, username, name }) => {
  console.log("running user registration");
  if (!email || !password || !username || !name) {
    throw new Error("name, email, password and username are required");
  }

  // check if the email already exist

  const emailExisted = await prisma.user.findUnique({
    where: { email: email },
  });

  if (emailExisted) {
    throw new Error("Email already exists");
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create new user

  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      username: username,
    },
    omit: { password: true },
    // or
    // select: {
    //   id: true,
    //   email: true,
    //   username: true,
    //   createdAt: true,
    // },
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("All fields are required");
  }
  // check if the user is in the database

  const User = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!User) {
    throw new Error("Invalid email or password");
  }

  // check password

  const isPasswordMatch = await bcrypt.compare(password, User.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  // remove password before returning User
  // const { password: _password, ...userWithoutPassword } = User;
  // return userWithoutPassword;

  const refreshToken = await generateRefreshToken();

  const hashToken = await hashRefreshToken(refreshToken);

  const accessToken = await generateAccessToken(User.id);

  console.log("unhash refresh token:", refreshToken);

  console.log("hashService:", hashToken);

  const newSession = await session.create(hashToken, User.id);

  if (!newSession) {
    throw new Error("Unable to Log in");
  }

  const user = await prisma.user.findUnique({
    where: { email: email },
    include: { session: true },
  });

  console.log(newSession);
  // or
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export { registerUser, loginUser };
