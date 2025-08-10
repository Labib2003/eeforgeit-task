import nodemailer from "nodemailer";
import env from "@/config/env.js";

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the email service
  host: "smtp.google.com", // SMTP server address
  port: 465, // Port for secure SMTP
  secure: true, // Use SSL for secure connection
  auth: {
    user: env.email.user, // Email address for authentication
    pass: env.email.pass, // Password for authentication
  },
});

export default transporter; // Export the transporter for use in other modules
