"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const requestOtpSchema = z.object({
  email: z
    .email("Invalid email")
    .min(1, "Email is required")
    .max(100, "Email must be less than 100 characters"),
});

const verifyOtpSchema = z.object({
  otp: z.string().min(5, "OTP must be 5 digits").max(5, "OTP must be 5 digits"),
});

export default function LoginForm() {
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const requestOtpForm = useForm<z.infer<typeof requestOtpSchema>>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const verifyOtpForm = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const onRequestOtp = async (values: z.infer<typeof requestOtpSchema>) => {
    try {
      const res = await axiosInstance.get("/auth/generate-otp", {
        params: { email: values.email },
      });
      if (res.data.success) {
        toast.success(`OTP: ${res.data.data.otp}`);
        setOtpRequested(true);
        setResendTimer(60);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to request OTP.");
    }
  };

  const onVerifyOtp = async (values: z.infer<typeof verifyOtpSchema>) => {
    const email = requestOtpForm.getValues("email");
    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        otp: values.otp,
      });

      if (res.data.success) {
        toast.success("Login successful");
        const authToken = res.data.data.accessToken;
        if (authToken) {
          localStorage.setItem("access_token", authToken);
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
          window.location.reload();
        } else {
          toast.error("Ops! Failed to navigate.");
        }
      } else {
        toast.error(res.data.message ?? "Login failed");
      }
    } catch (error) {
      if (error instanceof AxiosError)
        return toast.error(error.response?.data?.message);
      toast.error("An error occurred");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (otpRequested && resendTimer > 0) {
        setResendTimer((prev) => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [otpRequested, resendTimer]);

  return (
    <div className="space-y-6">
      {/* Email form */}
      <Form {...requestOtpForm}>
        <form
          onSubmit={requestOtpForm.handleSubmit(onRequestOtp)}
          className="space-y-3"
        >
          <FormField
            control={requestOtpForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      {...field}
                      disabled={otpRequested}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  We’ll send a 5-digit code to this address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!otpRequested && (
            <Button type="submit" className="w-full">
              Request OTP
            </Button>
          )}
        </form>
      </Form>

      {/* OTP form */}
      {otpRequested && (
        <Form {...verifyOtpForm}>
          <form
            onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)}
            className="space-y-4"
          >
            <FormField
              control={verifyOtpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={5} {...field}>
                      <InputOTPGroup className="flex gap-2 justify-center">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="h-11 w-11 rounded-md border border-black/30 text-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Didn’t get it? Check your spam folder.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setOtpRequested(false)}
                className="underline text-muted-foreground hover:text-foreground"
              >
                Change email
              </button>

              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={() => onRequestOtp(requestOtpForm.getValues())}
                className="underline text-primary disabled:text-muted-foreground"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>

            <Button type="submit" className="w-full">
              Verify OTP
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
