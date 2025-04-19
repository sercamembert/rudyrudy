import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="p-5">
      <SignedIn>
        <UserButton />
      </SignedIn>
      {user?.imageUrl}
      <div className="flex gap-5 mt-5">
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button variant={"secondary"}>Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}
