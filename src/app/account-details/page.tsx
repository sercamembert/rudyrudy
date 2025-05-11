import { ProfileForm } from "@/components/forms/ProfileForm";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findFirst({ where: { id: user.id } });

  if (dbUser) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <ProfileForm />
    </main>
  );
}
