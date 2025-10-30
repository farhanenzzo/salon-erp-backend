import express from "express";
import { REVENUE_ROUTES } from "../constants.js";
import { getRevenueStats } from "../controllers/revenue.js";

const router = express.Router();

router.route(REVENUE_ROUTES.BASE).get(getRevenueStats);

export default router;
