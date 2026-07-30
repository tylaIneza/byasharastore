import { z } from "zod";

export const sendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

export const teamMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});
