import dotenv from "dotenv";
dotenv.config();

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const MONGODB_URI = process.env.MONGODB_URI;
export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.PASSWORD;
