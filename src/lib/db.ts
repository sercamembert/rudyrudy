import { PrismaClient } from "../../prisma/generated"; // ✅ jeśli masz alias @ ustawiony

export const db = new PrismaClient();
