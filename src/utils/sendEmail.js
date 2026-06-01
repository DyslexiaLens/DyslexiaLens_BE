import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const getTransporter = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.mailFrom) {
    throw new Error("SMTP environment variables are not configured");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
};

export const sendOtpEmail = async ({ to, otp }) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"DyslexiaLens" <${env.mailFrom}>`,
    to,
    subject: "Kode OTP Reset Password",
    html: `
      <h2>Reset Password</h2>
      <p>Kode OTP kamu adalah:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>Kode ini berlaku selama 5 menit.</p>
      <p>Abaikan email ini jika kamu tidak meminta reset password.</p>
    `,
  });
};
