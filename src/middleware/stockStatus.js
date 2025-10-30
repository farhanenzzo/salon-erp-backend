import { ERROR_MESSAGES, STOCK_STATUSES } from "../constants.js";

/**
 * Middleware to determine and set the stock status based on the stock quantity.
 *
 * - Checks if `companyId` is provided in the request.
 * - Validates that `stockQuantity` is a number.
 * - Sets `stockStatus` in the request body based on the quantity:
 *   - OUT_OF_STOCK if quantity is 0 or less.
 *   - LOW_STOCK if quantity is less than 10.
 *   - IN_STOCK if quantity is 10 or more.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @returns {void}
 */
const stockStatusMiddleware = (req, res, next) => {
  let { stockQuantity } = req.body;
  const { companyId } = req;

  if (!companyId) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
  }

  // Convert stockQuantity to a number, in case it's received as a string
  const quantity = Number(stockQuantity);

  // Check for valid stock quantity
  if (isNaN(quantity)) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.STOCK_QUANTITY_MUST_BE_NUMBER });
  }

  // Determine the stock status based on quantity
  if (stockQuantity <= 0) {
    req.body.stockStatus = STOCK_STATUSES.OUT_OF_STOCK;
  } else if (stockQuantity < 10) {
    req.body.stockStatus = STOCK_STATUSES.LOW_STOCK;
  } else {
    req.body.stockStatus = STOCK_STATUSES.IN_STOCK;
  }

  next();
};

export default stockStatusMiddleware;
