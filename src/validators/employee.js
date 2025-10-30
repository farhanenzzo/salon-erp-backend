import Joi from "joi";

// Employee Validation Schema
const employeeValidationSchema = Joi.object({
  employeeName: Joi.string().min(3).max(100).required().messages({
    "string.base": `"employeeName" should be a type of 'text'`,
    "string.empty": `"employeeName" cannot be an empty field`,
    "any.required": `"employeeName" is a required field`,
  }),

  employeeEmail: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
    .required()
    .messages({
      "string.base": `"employeeEmail" should be a type of 'text'`,
      "string.email": `"employeeEmail" must be a valid email`,
      "any.required": `"employeeEmail" is a required field`,
    }),

  employeeRole: Joi.string().required().messages({
    "string.base": `"employeeRole" should be a type of 'text'`,
    "any.required": `"employeeRole" is a required field`,
  }),

  employeePhone: Joi.number()
    .required()
    .min(1000000000)
    .max(9999999999)
    .messages({
      "number.base": `"employeePhone" should be a number`,
      "number.min": `"employeePhone" should be at least 10 digits long`,
      "number.max": `"employeePhone" should be at most 10 digits long`,
      "any.required": `"employeePhone" is a required field`,
    }),

  employeeJoiningData: Joi.string().required().messages({
    "string.base": `"employeeJoiningData" should be a type of 'text'`,
    "any.required": `"employeeJoiningData" is a required field`,
  }),

  employeeSalary: Joi.number().required().messages({
    "number.base": `"employeeSalary" should be a number`,
    "any.required": `"employeeSalary" is a required field`,
  }),

  employeeAddress: Joi.string().required().messages({
    "string.base": `"employeeAddress" should be a type of 'text'`,
    "any.required": `"employeeAddress" is a required field`,
  }),

  employeeGender: Joi.string()
    .valid("Male", "Female", "Other")
    .required()
    .messages({
      "string.base": `"employeeGender" should be a type of 'text'`,
      "any.required": `"employeeGender" is a required field`,
      "any.only": `"employeeGender" must be one of the following: Male, Female, Other`,
    }),

  employeePhoto: Joi.string().optional().allow("").messages({
    "string.base": `"employeePhoto" should be a type of 'text'`,
  }),

  notes: Joi.string().optional().allow("").messages({
    "string.base": `"notes" should be a type of 'text'`,
  }),

  employeeStatus: Joi.string()
    .valid("Active", "In-active")
    .default("Active")
    .messages({
      "string.base": `"employeeStatus" should be a type of 'text'`,
      "any.only": `"employeeStatus" must be one of the following: Active, In-active`,
    }),
});

// Validation function to be used in the controller
const validateEmployee = (employeeData) => {
  const { error, value } = employeeValidationSchema.validate(employeeData, {
    abortEarly: false, // To capture all errors
    allowUnknown: true, // Allow extra fields not mentioned in the schema
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }

  return { isValid: true, data: value };
};

export default validateEmployee;
