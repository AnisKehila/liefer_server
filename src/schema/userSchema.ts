import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email({ message: "invalide email" }),
  phone: z.string().min(10).max(10),
  password: z.string().min(4),
});

export const loginSchema = z.object({
  phone: z.string().min(10).max(10),
  password: z.string(),
});
