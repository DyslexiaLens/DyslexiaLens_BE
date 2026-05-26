import { param } from "express-validator";

export const historyDetailValidator = [
  param("type")
    .isIn(["detection", "translation"])
    .withMessage("type must be detection or translation"),
  param("id").isInt({ gt: 0 }).withMessage("id must be positive integer"),
];
