import { prisma } from "../lib/prisma.js";

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB connected via prisma");
  } catch (error) {
    console.log(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};
const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
