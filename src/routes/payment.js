import express from "express";
import { PAYMENT_ROUTES } from "../constants.js";
import { listPayments } from "../controllers/payment.js";

const router = express.Router();

// router.route(PAYMENT_ROUTES.CREATE_PAYMENT).post(createPayment);
router.route(PAYMENT_ROUTES.LIST_PAYMENTS).get(listPayments);

export default router;
