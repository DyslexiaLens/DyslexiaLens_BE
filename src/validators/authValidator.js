import { body } from "express-validator";

export const registerValidator = [
  body("fullName").trim().notEmpty().withMessage("fullName is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("password").isLength({ min: 8 }).withMessage("password min length is 8"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("email must be valid"),
  body("password").notEmpty().withMessage("password is required"),
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("email must be valid"),
];

export const verifyOtpValidator = [
  body("email").isEmail().withMessage("email must be valid"),
  body("otpCode")
    .customSanitizer((val) => (val !== undefined && val !== null ? String(val) : ""))
    .isLength({ min: 6, max: 6 })
    .withMessage("otpCode must be 6 digits")
    .isNumeric()
    .withMessage("otpCode must contain only numbers"),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("email must be valid"),
  body("otpCode")
    .customSanitizer((val) => (val !== undefined && val !== null ? String(val) : ""))
    .isLength({ min: 6, max: 6 })
    .withMessage("otpCode must be 6 digits")
    .isNumeric()
    .withMessage("otpCode must contain only numbers"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("newPassword min length is 8"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("currentPassword is required"),
  body("otpCode")
    .optional({ checkFalsy: true })
    .customSanitizer((val) => (val !== undefined && val !== null ? String(val) : ""))
    .isLength({ min: 6, max: 6 })
    .withMessage("otpCode must be 6 digits")
    .isNumeric()
    .withMessage("otpCode must contain only numbers"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("newPassword min length is 8"),
];
