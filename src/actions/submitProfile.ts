// actions/submitProfile.ts
"use server";

import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation/profileSchema";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type ActionState = {
  error?: string;
  success?: boolean;
  redirect?: boolean;
};

export async function submitProfile(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await currentUser();

  if (!user) {
    return { redirect: true, error: "Użytkownik nie jest uwierzytelniony" };
  }

  // Pobierz dane o pełnym imieniu i nazwisku z Clerk
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || "";

  // Pobierz numer telefonu z Clerk jeśli jest dostępny
  const phoneNumber =
    user.phoneNumbers && user.phoneNumbers[0]
      ? user.phoneNumbers[0].phoneNumber
      : null;

  const validatedFields = profileSchema.safeParse({
    username: formData.get("username"),
    bio: formData.get("bio"),
    fullName, // Z Clerk
    phoneNumber, // Z Clerk
    email: user.primaryEmailAddress?.emailAddress,
    imageUrl: formData.get("profileImage") || user.imageUrl,
    id: user.id,
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.errors);
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        username: data.username,
        bio: data.bio,
        name: data.fullName, // Zapisz fullName w polu name
        phoneNumber: data.phoneNumber,
        imageUrl: data.imageUrl,
      },
      create: {
        id: data.id,
        email: data.email,
        username: data.username,
        bio: data.bio,
        name: data.fullName || "", // Zapisz fullName w polu name
        phoneNumber: data.phoneNumber,
        imageUrl: data.imageUrl,
      },
    });

    redirect("/");
  } catch (error) {
    console.error("Błąd podczas przesyłania profilu:", error);
    return {
      error: "Nie udało się zaktualizować profilu. Spróbuj ponownie.",
    };
  }
}
