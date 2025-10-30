import Joi from "joi";
import { parseISO, isBefore } from "date-fns";

// Validation schema for adding an appointment
const appointmentValidationSchema = Joi.object({
  clientId: Joi.string().required().messages({
    "string.empty": "Customer is required.",
    "any.required": "Customer is required.",
  }),
  clientName: Joi.string().optional().allow(null, "").messages({
    "string.empty": "Client name must be a string.",
  }),
  service: Joi.string().required().messages({
    "string.empty": "Service is required.",
  }),

  // appointmentDateTime field is optional
  appointmentDateTime: Joi.string().optional().messages({
    "string.empty": "Appointment date and time must be provided.",
  }),

  // date and time are now optional and will be validated together
  date: Joi.string().optional().messages({
    "string.empty": "Date must be a valid date.",
  }),
  time: Joi.string().optional().messages({
    "string.empty": "Time is required.",
  }),

  note: Joi.string().allow(null, "").optional(),
  stylistId: Joi.string().required().messages({
    "string.empty": "Employee is required.",
    "any.required": "Employee is required.",
  }),

  // Email validation
  email: Joi.string().email().optional().allow(null, "").messages({
    "string.email": "Email must be a valid email address.",
  }),

  // Gender validation - now accepts empty string
  gender: Joi.string().valid("Male", "Female", "Other").allow("").optional(),

  // Date of birth validation
  dob: Joi.date().optional().messages({
    "date.base": "Date of birth must be a valid date.",
  }),

  // Phone number validation - now accepts empty string
  phoneNumber: Joi.string().optional().allow("").pattern(/^\d+$/).messages({
    "string.pattern.base": "Phone number must contain only numbers.",
  }),

  // Paid status validation
  paidStatus: Joi.string()
    .valid("paid", "un-paid", "processing")
    .default("un-paid")
    .messages({
      "any.only":
        "Paid status must be one of 'paid', 'un-paid', or 'processing'.",
    }),
});

// Validate that the provided appointment date is in the future
const validateAppointmentDate = (date, time) => {
  const appointmentDateTime = `${date} ${time}`;
  const appointmentDateTimeISO = parseISO(appointmentDateTime); // Parse to Date object

  // Check if the appointment date and time are in the future
  if (isBefore(appointmentDateTimeISO, new Date())) {
    return "Appointment date and time must be in the future.";
  }

  return null;
};

// Validate the appointment input
export const validateAppointmentInput = (data) => {
  const { error } = appointmentValidationSchema.validate(data, {
    abortEarly: false,
  });

  // Check if there's an error
  if (error) {
    return { error };
  }

  // If appointmentDateTime is provided, validate that it is in the future
  if (data.appointmentDateTime) {
    const appointmentDateTimeISO = parseISO(data.appointmentDateTime); // Parse to Date object
    if (isBefore(appointmentDateTimeISO, new Date())) {
      return {
        error: {
          details: [
            { message: "Appointment date and time must be in the future." },
          ],
        },
      };
    }
  }

  // If both date and time are provided, validate them
  if (data.date && data.time) {
    const dateValidationError = validateAppointmentDate(data.date, data.time);
    if (dateValidationError) {
      return { error: { details: [{ message: dateValidationError }] } };
    }
  }

  return { error: null };
};
