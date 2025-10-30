import Joi from "joi";

// Define the validation schema for the offer
const offerValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),

  message: Joi.string().required().messages({
    "string.base": "Message must be a string.",
    "any.required": "Message is required.",
  }),

  type: Joi.string().valid("Offer", "Announcement").required().messages({
    "string.base": "Type must be a string.",
    "any.required": "Type is required.",
    "any.only": 'Type must be either "Offer" or "Announcement".',
  }),

  targetAudience: Joi.string()
    .valid("All users", "New users", "Returning users")
    .required()
    .messages({
      "string.base": "Target Audience must be a string.",
      "any.required": "Target Audience is required.",
      "any.only":
        'Target Audience must be one of the following: "All users", "New users", or "Returning users".',
    }),

  dateRange: Joi.object({
    start: Joi.date().required().messages({
      "date.base": "Start date must be a valid date.",
      "any.required": "Start date is required.",
    }),
    end: Joi.date().greater(Joi.ref("start")).required().messages({
      "date.base": "End date must be a valid date.",
      "any.required": "End date is required.",
      "date.greater": "End date must be later than start date.",
    }),
  }).required(),

  notificationStatus: Joi.string()
    .valid("Scheduled", "Draft")
    .required()
    .messages({
      "string.base": "Notification Status must be a string.",
      "any.required": "Notification Status is required.",
      "any.only": 'Notification Status must be either "Scheduled" or "Draft".',
    }),
});

export { offerValidationSchema };

// Validation Middleware
const validateOffer = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "No data provided.",
      errors: ["Request body is empty. Please provide offer details."],
    });
  }
  const { error } = offerValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation failed.",
      errors: error.details.map((err) => err.message),
    });
  }
};

export { validateOffer };
