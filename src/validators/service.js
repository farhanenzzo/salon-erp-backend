import Joi from "joi";

const serviceValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Service name is required.",
    "any.required": "Service name is required.",
  }),
  duration: Joi.number().required().messages({
    "number.base": "Duration must be a number.",
    "any.required": "Duration is required.",
  }),
  price: Joi.number().required().messages({
    "number.base": "Price must be a number.",
    "any.required": "Price is required.",
  }),
  roles: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Roles must be an array of strings.",
  }),
  description: Joi.string().optional(),
});

export const validateServiceInput = (data) =>
  serviceValidationSchema.validate(data, { abortEarly: false });
