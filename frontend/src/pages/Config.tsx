import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Info, TimerReset } from "lucide-react";

// --- Schema ---
const configSchema = z.object({
  examLengthInMinutes: z
    .number()
    .int("Must be an integer")
    .positive("Must be positive"),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function ConfigPage() {
  const navigate = useNavigate();

  const lsUser = localStorage.getItem("user");
  const user = lsUser ? JSON.parse(lsUser) : null;
  if (!user) window.location.href = "/";

  useEffect(() => {
    if (user.role === "STUDENT") navigate("/dashboard/evaluate");
    if (user.role === "SUPERVISOR") navigate("/dashboard/submissions");
  }, [user, navigate]);

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: { examLengthInMinutes: 0 },
  });

  // Fetch config on mount
  const fetchConfig = async () => {
    try {
      const res = await axiosInstance.get("/config");
      const data = res?.data?.data;
      if (data?.examLengthInMinutes !== undefined) {
        form.reset({ examLengthInMinutes: data.examLengthInMinutes });
      }
    } catch {
      toast.error("Failed to load config");
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const onSubmit = async (values: ConfigFormData) => {
    try {
      await axiosInstance.patch("/config", values); // keeping your existing request shape
      toast.success("Config updated successfully");
    } catch {
      toast.error("Failed to update config");
    }
  };

  return (
    <div className="py-8">
      {/* Header strip */}
      <div className="mb-6 rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-teal-500/15 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Exam Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Control global exam settings. Changes take effect immediately.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Admin
          </Badge>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main form */}
        <Card className="md:col-span-2 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TimerReset className="h-5 w-5 text-primary" />
              Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="examLengthInMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Length (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : "",
                              )
                            }
                            className="pr-16"
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-2 grid place-items-center text-xs text-muted-foreground">
                            minutes
                          </span>
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Recommended: <span className="font-medium">44</span>{" "}
                        minutes. Set to match your exam complexity.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={fetchConfig}>
                    Reset
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info / helper panel */}
        <Card className="border-muted/60">
          <CardHeader className="bg-muted/40">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-muted-foreground" />
              Tips & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
              <p>
                The exam timer starts when a student initiates a step and ends
                automatically when time runs out.
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                Shorter exams reduce fatigue; consider 30–45 minutes for Step 1.
              </li>
              <li>
                Changing this value affects all new evaluations immediately.
              </li>
              <li>
                Students are warned not to refresh/close the window during an
                exam.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
