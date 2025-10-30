import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "./env.js";

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Explicitly set host
  auth: {
    type: "login",
    user: EMAIL, // Your email
    pass: PASSWORD, // Your email password
  },
});

export default transporter;
