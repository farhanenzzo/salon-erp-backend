import Joi from "joi";

const stockValidationSchema = Joi.object({
  stockName: Joi.string().required().messages({
    "string.empty": "Stock name is required.",
  }),
  stockCategory: Joi.string().required().messages({
    "string.empty": "Stock category is required.",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a valid number.",
    "number.positive": "Price must be greater than zero.",
    "any.required": "Price is required.",
  }),
  stockQuantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock quantity must be a valid number.",
    "number.min": "Stock quantity cannot be negative.",
    "any.required": "Stock quantity is required.",
  }),
  stockMFGDate: Joi.date().required().messages({
    "date.base": "Manufacturing date must be a valid date.",
    "any.required": "Manufacturing date is required.",
  }),
  stockEXPDate: Joi.date().min(Joi.ref("stockMFGDate")).required().messages({
    "date.base": "Expiration date must be a valid date.",
    "date.min": "Expiration date must be after the manufacturing date.",
    "any.required": "Expiration date is required.",
  }),
  reorderQuantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Reorder quantity must be a valid number.",
    "number.min": "Reorder quantity cannot be negative.",
    "any.required": "Reorder quantity is required.",
  }),
  stockDescription: Joi.string().allow(null, "").optional().messages({
    "string.base": "Description must be a string.",
  }),
}).unknown();

export { stockValidationSchema };
