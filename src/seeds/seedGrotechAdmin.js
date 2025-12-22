import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import GrotechAdmin from "../models/GrotechAdmin.js";
import { connectDB } from "../config/database.js";

const seedGrotechAdmin = async () => {
    await connectDB();

    try {
        const existingGrotechAdmin = await GrotechAdmin.findOne();

        if (existingGrotechAdmin) {
            console.log("Grotech Admin already exists.");
            return;
        }

        const passcode = "admin123"; // Default passcode
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passcode, salt);

        const newGrotechAdmin = new GrotechAdmin({
            passcode: hashedPassword,
        });

        await newGrotechAdmin.save();
        console.log("Grotech Admin created successfully with passcode: admin123");
    } catch (error) {
        console.error("Error seeding Grotech Admin:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedGrotechAdmin();
