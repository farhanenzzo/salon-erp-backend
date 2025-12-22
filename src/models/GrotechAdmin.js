import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
    passcode: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const GrotechAdmin = mongoose.model("GrotechAdmin", superAdminSchema);

export default GrotechAdmin;
