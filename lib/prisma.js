// lib/prisma.js
import { PrismaClient } from "./generated/prisma";
// Prevent multiple PrismaClient instances in development
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;