"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import axiosInstance from "@/utils/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const requestOtpSchema = z.object({
  email: z
    .email("Invalid email")
    .min(1, "Email is required")
    .max(100, "Email must be less than 100 characters"),
});

const verifyOtpSchema = z.object({
  otp: z.string().min(5).max(5),
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
  });

  const onRequestOtp = async (values: z.infer<typeof requestOtpSchema>) => {
    try {
      const email = values.email;
      const res = await axiosInstance.get("/auth/generate-otp", {
        params: { email },
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
          window.location.reload();
        } else {
          toast.error("Ops! Failed to navigate.");
        }
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      if (error instanceof AxiosError)
        return toast.error(error.response?.data.message);
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
    <div className="bg-white border rounded-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Log in</h1>

      {/* Email Form */}
      <Form {...requestOtpForm}>
        <form onSubmit={requestOtpForm.handleSubmit(onRequestOtp)}>
          <FormField
            control={requestOtpForm.control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <label>Email</label>
                <FormControl>
                  <div className="flex items-center border rounded px-3 py-2">
                    <Mail className="mr-2 text-gray-500" />
                    <input
                      type="email"
                      className="outline-none w-full"
                      placeholder="you@example.com"
                      {...field}
                      disabled={otpRequested}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!otpRequested && (
            <button
              type="submit"
              className="mt-6 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Request OTP
            </button>
          )}
        </form>
      </Form>

      {/* OTP Form */}
      {otpRequested && (
        <Form {...verifyOtpForm}>
          <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)}>
            <FormField
              control={verifyOtpForm.control}
              name="otp"
              rules={{
                required: "OTP is required",
                minLength: { value: 5, message: "OTP must be 5 digits" },
              }}
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormControl>
                    <div className="mt-5 w-full flex justify-center">
                      <InputOTP maxLength={5} {...field}>
                        <InputOTPGroup className="grid grid-cols-5 gap-3">
                          {[...Array(5)].map((_, i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="p-5 text-xl border-2 border-gray-300 rounded"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-center mt-3">
              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={() => onRequestOtp(requestOtpForm.getValues())}
                className={`text-green-600 text-sm ${
                  resendTimer > 0 ? "opacity-50" : ""
                }`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
            <button
              type="submit"
              className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Verify OTP
            </button>
          </form>
        </Form>
      )}
    </div>
  );
}
