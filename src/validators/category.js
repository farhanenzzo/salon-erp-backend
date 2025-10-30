import Joi from "joi";

// Validation schema for creating a category with a single service
const categoryValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Category name is required.",
    "any.required": "Category name is required.",
  }),
  image: Joi.string()
    .uri()
    .allow(null, "") // Allow null or an empty string
    .optional()
    .messages({
      "string.uri": "Image must be a valid URL.",
    }),

  // Fields for the single service
  serviceName: Joi.string().required().messages({
    "string.empty": "Service name is required.",
    "any.required": "Service name is required.",
  }),
  price: Joi.number().required().messages({
    "number.base": "Price must be a number.",
    "any.required": "Price is required.",
  }),
  description: Joi.string().optional(),
  roles: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Roles must be an array of strings.",
  }),
  duration: Joi.string()
    .pattern(/^(\d+(\.\d+)?)\s?(minutes?|mins?|hours?|hrs?)$/i)
    .required()
    .messages({
      "string.base": "Duration must be a string.",
      "string.empty": "Duration cannot be empty.",
      "string.pattern.base":
        "Duration must be a valid time format (e.g., '30 minutes', '1 hour', '1.5 hours', '45 mins').",
    }),
});

export const validateCategoryInput = (data) =>
  categoryValidationSchema.validate(data, { abortEarly: false });
