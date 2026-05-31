import { body } from "express-validator";

export const updateProfileValidator = [
  body("fullName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("fullName must be non-empty string"),
  body("phone").optional().isString().withMessage("phone must be string"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("birthDate must be valid date"),
  body("avatarUrl")
    .optional()
    .isString()
    .withMessage("avatarUrl must be string"),
];

export const updateAddressValidator = [
  body("country").isString().notEmpty().withMessage("country is required"),
  body("city").isString().notEmpty().withMessage("city is required"),
  body("postalCode")
    .isString()
    .notEmpty()
    .withMessage("postalCode is required"),
];
