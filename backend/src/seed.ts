/* eslint-disable no-console */
import prisma from "./config/prisma";

(async () => {
  console.log("Checking for existing config...");
  const config = await prisma.config.findFirst();
  if (!config) {
    console.log("No config found. Creating default config...");
    await prisma.config.create({ data: {} });
    console.log("Default config created.");
  } else {
    console.log("Config already exists.");
  }

  console.log("Checking for existing admin user...");
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) {
    console.log("No admin user found. Creating admin user...");
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@test_school.edu",
        role: "ADMIN",
      },
    });
    console.log("Admin user created.");
  } else {
    console.log("Admin user already exists.");
  }
})();
