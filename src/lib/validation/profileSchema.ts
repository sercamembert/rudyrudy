// lib/validation/profileSchema.ts
import { z } from "zod";

export const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki")
    .max(30, "Nazwa użytkownika nie może przekraczać 30 znaków")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Nazwa użytkownika może zawierać tylko litery, cyfry i podkreślniki"
    ),
  bio: z.string().max(160, "Bio nie może przekraczać 160 znaków").optional(),
  profileImage: z.string().url().optional(),
});

export const profileSchema = z.object({
  username: z.string().min(3, { message: "Nazwa użytkownika jest wymagana" }),
  bio: z.string().optional().nullable(),
  fullName: z.string().optional(), // Zachowane do zapisania w bazie danych
  phoneNumber: z.string().optional().nullable(), // Zachowane do zapisania w bazie danych
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  id: z.string({
    invalid_type_error: "Nieprawidłowe ID",
    required_error: "ID jest wymagane",
  }),
  imageUrl: z.string().url({ message: "Nieprawidłowy URL" }).optional(),
});
