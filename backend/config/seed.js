import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./db.js";
import { User } from "../models/User.js";

dotenv.config();

const seedUsers = [
  {
    name: "Super Admin",
    email: "admin@2005.com",
    password: "admin123",
    role: "admin",
    phone: "+91 99999 00001",
  },
  {
    name: "Prof. Milkesh Jain",
    email: "tpo@placenext.com",
    password: "tpo12345",
    role: "tpo",
    phone: "+91 94035 60548",
  },
  {
    name: "Prof. K.D.Deore",
    email: "tpo@placenext1.com",
    password: "tpo12345",
    role: "tpo",
    phone: "+91 98234 88519",
  },
];

const seed = async () => {
  await connectDB();
  console.log("🌱 Starting seed...");

  for (const userData of seedUsers) {
    const exists = await User.findOne({ email: userData.email });

    if (exists) {
      console.log(`⚠️ User ${userData.email} already exists, skipping.`);
      continue;
    }

    // ✅ Let User.create() trigger the pre-save hook for password hashing
    await User.create(userData);

    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  console.log("\n📋 Seed Credentials:");
  console.log("----------------------------");
  seedUsers.forEach((u) => {
    console.log(
      `${u.role.toUpperCase().padEnd(8)} | ${u.email.padEnd(
        25
      )} | Password: ${u.password}`
    );
  });
  console.log("----------------------------");

  mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});