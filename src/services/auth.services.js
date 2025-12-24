// register user

import { prisma } from "../libs/prisma.js";
import bcrypt from "bcryptjs";

const registerUser = async ({ email, password, username }) => {
  console.log("running user registration");
  if (!email || !password || !username) {
    throw new Error("Email, password and username are required");
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
      email: email,
      password: hashedPassword,
      username: username,
    },
    // omit: { password: true },
    // or
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });

  return user;
};

export { registerUser };
