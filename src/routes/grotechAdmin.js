import express from "express";
import { login, getGlobalUserCount } from "../controllers/grotechAdminAuth.js";
import { checkGrotechAdmin } from "../middleware/checkGrotechAdmin.js";

const router = express.Router();

router.post("/login", login);
router.get("/users/count", checkGrotechAdmin, getGlobalUserCount);

export default router;
