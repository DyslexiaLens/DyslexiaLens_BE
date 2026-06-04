import crypto from "crypto";

export const generateOtpCode = () =>
  String(crypto.randomInt(100000, 999999));
