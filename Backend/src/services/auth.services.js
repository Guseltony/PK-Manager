// register user

import { prisma } from "../libs/prisma.js";
import bcrypt from "bcryptjs";
import session from "./session.service.js";

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

const loginUser = async ({ email, password }, hashRefreshToken) => {
  if (!email || !password) {
    throw new Error("All fields are required");
  }
  // check if the user is in the database

  const user = await prisma.user.findUnique({
    where: { email: email },
    include: { session: true },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  await session.create(hashRefreshToken, user.id)

  // check password

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  // remove password before returning user
  // const { password: _password, ...userWithoutPassword } = user;
  // return userWithoutPassword;

  // or
  return user;
};

export { registerUser, loginUser };
