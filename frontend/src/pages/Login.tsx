import LoginForm from "@/components/custom/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, ShieldCheck, Mail, Sparkles } from "lucide-react";

const Login = () => {
  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: Hero / Info */}
      <section className="relative hidden bg-gradient-to-br from-lime-100 via-teal-100 to-white lg:block">
        <div className="relative h-full w-full p-10 text-gray-800">
          <div className="mx-auto flex h-full max-w-xl flex-col justify-center gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Test_School Demo
              </Badge>
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Welcome to <span className="text-primary">Test School</span>
            </h1>

            <p className="text-sm text-gray-700">
              This demo uses a simple <strong>OTP-based login</strong> for quick
              access—no signup form required. New users are automatically
              registered as <strong>Students</strong>.
              <br />
              The server is hosted on a <strong>free</strong> render.com
              instance, so it may take a few seconds to wake up.
            </p>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-gray-800">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">How OTP works</p>
              </div>
              <ul className="ml-5 list-disc space-y-1 text-sm text-gray-700">
                <li>Enter your email and request an OTP.</li>
                <li>For demo convenience, OTPs also appear in UI toasts.</li>
                <li>Use the shown OTP to complete login.</li>
              </ul>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-800">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Preconfigured accounts</p>
              </div>
              <div className="grid gap-2 rounded-md bg-gray-50 p-3 text-xs font-mono leading-6 text-gray-800">
                <div>
                  <span className="text-gray-500">Admin:</span>{" "}
                  <code>admin@testschool.edu</code>
                </div>
                <div>
                  <span className="text-gray-500">Supervisor:</span>{" "}
                  <code>supervisor@testschool.edu</code>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                These roles unlock admin and reviewing features in the
                dashboard.
              </p>
            </div>

            <Separator className="bg-gray-200" />

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-gray-800">
                <Mail className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Certificates via email</p>
              </div>
              <p className="text-sm text-gray-700">
                Nodemailer is configured. After passing an evaluation, click{" "}
                <em>Get Certificate</em> and your certificate will be sent to
                your email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right: Auth form */}
      <section className="grid place-items-center bg-background px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-gray-800">
              Sign in to continue
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Use your email to receive a one-time passcode.
            </p>
          </div>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-base text-gray-800 text-center">
                One-time Passcode (OTP)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <LoginForm />
              <p className="mt-4 text-xs text-gray-600">
                For demo convenience, OTPs are shown in a toast notification
                after you request one.
              </p>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in you agree to the demo’s basic terms. No real data is
            stored.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
