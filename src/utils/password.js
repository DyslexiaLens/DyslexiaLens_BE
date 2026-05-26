import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = (plainTextPassword) =>
  bcrypt.hash(plainTextPassword, SALT_ROUNDS);

export const comparePassword = (plainTextPassword, hashedPassword) =>
  bcrypt.compare(plainTextPassword, hashedPassword);
