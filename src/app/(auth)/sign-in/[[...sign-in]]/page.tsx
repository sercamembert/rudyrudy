"use client";

import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { EmailCodeFactor, OAuthStrategy } from "@clerk/types";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Logo from "@/components/icons/Logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isEmailValid } from "@/lib/isEmailValid";
import GoogleIcon from "@/components/icons/GoogleIcon";
import AppleIcon from "@/components/icons/AppleIcon";
import EmailIcon from "@/components/icons/EmailIcon";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { LoaderCircle } from "lucide-react";

export default function Page() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailCodeFactor, setEmailCodeFactor] =
    useState<EmailCodeFactor | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState("");

  const router = useRouter();

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn?.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sign-in/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoaded || !signIn) return null;

    setLoading(true);
    setSignInError("");

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: email,
      });

      const isEmailCodeFactor = (factor: any): factor is EmailCodeFactor => {
        return factor.strategy === "email_code";
      };

      const emailFactor = supportedFirstFactors?.find(isEmailCodeFactor);

      if (emailFactor) {
        setEmailCodeFactor(emailFactor);
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });

        setVerifying(true);
      }
    } catch (err: any) {
      console.error("Error:", JSON.stringify(err, null, 2));
      if (err.errors && err.errors[0]?.message) {
        setSignInError(err.errors[0].message);
      } else {
        setSignInError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!isLoaded || !signIn || !emailCodeFactor) return;

    setResendLoading(true);
    setResendError("");

    try {
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      });
    } catch (err) {
      console.error("Error resending code:", JSON.stringify(err, null, 2));
      setResendError("Failed to resend the code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoaded || !signIn) return null;

    setVerificationError("");
    setLoading(true);

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      } else {
        setVerificationError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      if (err.errors && err.errors[0]?.message) {
        setVerificationError(err.errors[0].message);
      } else {
        setVerificationError("Invalid code. Please check and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col gap-10 md:gap-[51px] xl:gap-18 desktop:gap-20 px-5 md:px-0">
      <div className="flex justify-center md:justify-start pt-[73px] md:pt-12 xl:pt-16 desktop:pt-20 md:pl-12 xl:pl-16 desktop:pl-20">
        <Logo className="w-[84px] md:w-16 xl:w-[86px] desktop:w-[105px]" />
      </div>
      {!verifying ? (
        <div className="flex flex-col items-center gap-[25px] xl:gap-[30px]">
          <div className="flex flex-col items-center">
            <h1 className="text-center font-primary text-[27px] md:text-3xl xl:text-[40px] desktop:text-[43px] !leading-normal">
              Welcome back
            </h1>
            <p className="max-w-[40ch] md:max-w-full text-center font-secondary text-black/70 text-sm md:text-xs xl:text-base desktop:text-lg !leading-normal">
              Sign in to continue managing your projects with Real
            </p>
          </div>

          <div className="flex flex-col gap-3.5 xl:gap-5 w-full max-w-[335px] md:max-w-[300px] xl:max-w-[373px] desktop:max-w-[400px]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 md:gap-2.5 xl:gap-4"
            >
              <div className="relative">
                <Input
                  value={email}
                  id="email"
                  name="email"
                  placeholder={isFocused ? "" : "yourmail@email.com"}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  required
                  className={`border-black/30 shadow-none h-[45px] md:h-9 xl:h-12 desktop:h-[50px] rounded-full font-secondary font-medium placeholder:font-normal text-base md:text-[13px] xl:text-base desktop:text-[17px]
                  
                  ${
                    isFocused || email.length !== 0
                      ? "px-5 md:px-4 xl:px-6"
                      : "pl-10 md:pl-[35px] xl:pl-[44px] desktop:pl-[46px]"
                  }`}
                />
                {!isFocused && email.length === 0 && (
                  <EmailIcon className="absolute w-3.5 md:w-3 xl:w-4 desktop:w-[17px] top-1/2 -translate-y-1/2 left-[17px] md:left-[15px] xl:left-[19px] desktop:left-5" />
                )}
              </div>

              {signInError && (
                <p className="text-red-500 font-secondary text-xs xl:text-sm !leading-none">
                  {signInError}
                </p>
              )}

              <Button
                disabled={!isEmailValid(email) || loading}
                size={"auth"}
                className="w-full bg-black text-white disabled:bg-black/10 disabled:text-black/40 text-[13px] md:text-[11px] xl:text-sm tracking-[0.3px]"
                type="submit"
              >
                {!loading ? (
                  "Continue with email"
                ) : (
                  <LoaderCircle className="text-white animate-spin h-3.5 xl:h-4" />
                )}
              </Button>
            </form>
            <p className="text-center font-secondary text-black/70 text-xs md:text-[10px] xl:text-sm">
              or
            </p>
            <div className="flex flex-col gap-3 md:gap-2.5 xl:gap-4">
              <Button
                size={"auth"}
                variant={"secondary"}
                className="w-full font-medium font-primary"
                onClick={() => signInWith("oauth_google")}
              >
                <GoogleIcon className="w-[18px] md:w-[15px] xl:w-5" /> Sign in
                with Google
              </Button>
              <Button
                size={"auth"}
                className=" w-full font-medium font-primary"
                onClick={() => signInWith("oauth_apple")}
              >
                <AppleIcon className="w-[15px] md:w-3 xl:w-[15px] desktop:w-4" />{" "}
                Sign in with Apple
              </Button>
            </div>
          </div>

          <p className="text-center font-secondary text-sm md:text-xs xl:text-sm text-black/70">
            Don't have an account?
            <br /> Please{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-black/90 hover:brightness-90 duration-300 "
            >
              Sign up
            </Link>
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleVerification}
          className="flex flex-col gap-[25px] xl:gap-[30px] max-w-max mx-auto lg:min-w-[298px] xl:min-w-[369px] desktop:min-w-[400px]"
        >
          <div className="flex flex-col">
            <h1 className="font-primary text-[27px] md:text-3xl xl:text-[40px] desktop:text-[43px] !leading-normal">
              We sent you a code
            </h1>
            <p className="font-secondary text-black/70 text-sm md:text-xs xl:text-base desktop:text-lg !leading-normal">
              Please check your mail and enter the code below
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:gap-3.5 w-full">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
            >
              <InputOTPGroup className="w-full h-[37px] xl:h-[45px] desktop:h-[50px] px-[14px] xl:px-4 desktop:px-5">
                <InputOTPSlot index={0} />
                <InputOTPSeparator className="text-black/40 !leading-none font-secondary font-medium text-[7px] xl:text-[9px] desktop:text-[10px]" />
                <InputOTPSlot index={1} />
                <InputOTPSeparator className="text-black/40 !leading-none font-secondary font-medium text-[7px] xl:text-[9px] desktop:text-[10px]" />
                <InputOTPSlot index={2} />
                <InputOTPSeparator className="text-black/40 !leading-none font-secondary font-medium text-[7px] xl:text-[9px] desktop:text-[10px]" />
                <InputOTPSlot index={3} />
                <InputOTPSeparator className="text-black/40 !leading-none font-secondary font-medium text-[7px] xl:text-[9px] desktop:text-[10px]" />
                <InputOTPSlot index={4} />
                <InputOTPSeparator className="text-black/40 !leading-none font-secondary font-medium text-[7px] xl:text-[9px] desktop:text-[10px]" />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {verificationError && (
              <p className="text-red-500 font-secondary text-xs xl:text-sm !leading-none">
                Code is incorrect
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-3.5 xl:gap-5 w-full max-w-[335px] md:max-w-[300px] xl:max-w-[373px] desktop:max-w-[400px]">
            <div className="flex flex-wrap font-secondary text-sm md:text-xs xl:text-sm">
              <p className="text-black/70">The code didn&apos;t arrive?</p>
              &nbsp;
              <button
                className="font-semibold text-black/90 hover:brightness-90 duration-300 cursor-pointer"
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? "Resending..." : "Click here to resend it "}
              </button>
            </div>
          </div>

          {/* buttons */}
          <div className="flex gap-2.5 w-full max-w-[335px] md:max-w-[300px] xl:max-w-[373px] desktop:max-w-[400px]">
            <Button
              onClick={() => setVerifying(false)}
              size={"auth"}
              className="w-[29%]"
            >
              Back
            </Button>
            <Button
              variant={"secondary"}
              size={"auth"}
              className="w-[71%]"
              type="submit"
              disabled={code.length < 6 || loading}
            >
              {!loading ? (
                <p>Continue</p>
              ) : (
                <LoaderCircle className="text-white animate-spin h-3.5 xl:h-4" />
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-auto pb-[70px] md:pb-8 xl:pb-14 desktop:pb-[73px]">
        <p className="text-center max-w-[30ch] mx-auto font-secondary text-black/50 text-[10px] xl:text-sm ">
          By signing in, you agree to the{" "}
          <Link href="/" className="underline">
            Terms of Use
          </Link>
          ,{" "}
          <Link href="/" className="underline">
            Privacy Notice
          </Link>
          , and Cookie Notice
        </p>
      </div>
    </div>
  );
}
