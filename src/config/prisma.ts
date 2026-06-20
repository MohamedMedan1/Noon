<<<<<<< HEAD
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
=======
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
>>>>>>> feature/wishlist-system

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

<<<<<<< HEAD
export const prisma = new PrismaClient({
  adapter,
});
=======
export const prisma = new PrismaClient({ adapter });
>>>>>>> feature/wishlist-system
