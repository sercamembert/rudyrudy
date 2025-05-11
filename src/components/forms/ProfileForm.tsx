// components/ProfileForm.tsx
"use client";

import { useEffect, startTransition, useState } from "react";
import { useActionState } from "react";
import { submitProfile } from "@/actions/submitProfile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileFormSchema } from "@/lib/validation/profileSchema";
import { AvatarUpload } from "@/components/Avatar";

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user } = useUser();
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
    user?.imageUrl
  );

  const [state, formAction, isPending] = useActionState(submitProfile, {});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    // Dodaj URL obrazu do formularza
    if (profileImageUrl) {
      formData.append("profileImage", profileImageUrl);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  const handleImageUpload = (url: string) => {
    setProfileImageUrl(url);
    setValue("profileImage", url);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Witaj w Real!</CardTitle>
        <CardDescription>Skonfiguruj swój profil</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload Component */}
          <div className="flex justify-center mb-4">
            <AvatarUpload
              userId={user?.id || ""}
              initialImageUrl={user?.imageUrl}
              onImageUpload={handleImageUpload}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="username">Nazwa użytkownika</Label>
            <Input id="username" {...register("username")} />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Napisz kilka słów o sobie..."
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" aria-disabled={isPending}>
            {!isPending ? "Kontynuuj" : "Zapisywanie... "}
          </Button>

          {state.error && (
            <p className="text-red-500 text-sm mt-2" role="alert">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-green-500 text-sm mt-2" role="alert">
              Profil został pomyślnie zaktualizowany
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
